-- BHS Commerce initial PostgreSQL foundation.
-- Apply with a migration role. The application must set app.tenant_id transaction-locally
-- only after verifying the authenticated session on the server.
create extension if not exists pgcrypto;

create type public.platform_role as enum ('platform_owner','brand_admin');
create type public.tenant_status as enum ('setup','active','suspended','deleted');
create type public.subscription_status as enum ('trialing','active','past_due','canceled','expired');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  status public.tenant_status not null default 'setup',
  deleted_at timestamptz,
  recover_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_slug_format check (slug ~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$')
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete restrict,
  email text not null,
  password_hash text not null,
  role public.platform_role not null default 'brand_admin',
  is_active boolean not null default true,
  failed_login_count integer not null default 0 check (failed_login_count >= 0),
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_owner_no_tenant check (role <> 'platform_owner' or tenant_id is null),
  constraint brand_admin_requires_tenant check (role <> 'brand_admin' or tenant_id is not null)
);
create unique index users_tenant_email_unique on public.users(tenant_id, lower(email)) where tenant_id is not null;
create unique index users_owner_email_unique on public.users(lower(email)) where tenant_id is null;

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  ip_hash text,
  user_agent text
);
create index sessions_user_active_idx on public.sessions(user_id, expires_at) where revoked_at is null;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete restrict,
  provider text not null default 'paystack',
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null default 'starter',
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_payment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  price_minor bigint not null check (price_minor >= 0),
  currency char(3) not null default 'NGN',
  sku text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_published boolean not null default false,
  deleted_at timestamptz,
  recover_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug),
  unique(tenant_id, sku)
);
create index products_tenant_visible_idx on public.products(tenant_id, created_at desc) where deleted_at is null;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_number text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending','paid','processing','fulfilled','cancelled','refunded')),
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  total_minor bigint not null default 0 check (total_minor >= 0),
  currency char(3) not null default 'NGN',
  deleted_at timestamptz,
  recover_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, order_number)
);
create index orders_tenant_created_idx on public.orders(tenant_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete restrict,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_tenant_created_idx on public.audit_events(tenant_id, created_at desc);

-- Tenant-owned data: force RLS even for table owners. The app must establish tenant
-- context in each transaction after validating the session and its tenant membership.
do $$
declare t text;
begin
  foreach t in array array['sessions','subscriptions','products','orders','order_items','audit_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy tenant_isolation on public.%I using (tenant_id = nullif(current_setting(''app.tenant_id'', true), '''')::uuid) with check (tenant_id = nullif(current_setting(''app.tenant_id'', true), '''')::uuid)', t);
  end loop;
end $$;

alter table public.tenants enable row level security;
alter table public.tenants force row level security;
create policy tenant_self_read on public.tenants for select
  using (id = nullif(current_setting('app.tenant_id', true), '')::uuid);
alter table public.users enable row level security;
alter table public.users force row level security;
create policy tenant_users_read on public.users for select
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

-- No browser/client role receives direct table grants. Add narrowly scoped grants
-- to a server-only application role after the authorization layer is implemented.


-- Storage capacity and media accounting model.
-- BHS Commerce storage capacity model.
-- Capacity is a persistent ceiling, not a monthly upload allowance.
-- The included 2 GiB does not reset or accumulate each billing month.
create table if not exists public.tenant_storage_accounts (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  capacity_bytes bigint not null default 2147483648 check (capacity_bytes >= 0),
  used_bytes bigint not null default 0 check (used_bytes >= 0),
  updated_at timestamptz not null default now(),
  constraint storage_usage_within_capacity check (used_bytes <= capacity_bytes)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  media_type text not null check (media_type in ('image','video')),
  idempotency_key text not null,
  original_size_bytes bigint not null check (original_size_bytes > 0),
  optimized_size_bytes bigint check (optimized_size_bytes is null or optimized_size_bytes >= 0),
  storage_footprint_bytes bigint check (storage_footprint_bytes is null or storage_footprint_bytes >= 0),
  original_object_key text,
  optimized_manifest jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','active','deleted','failed')),
  quota_released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);
create index if not exists media_assets_tenant_active_idx
  on public.media_assets(tenant_id, created_at desc) where status in ('pending','active');

create table if not exists public.tenant_storage_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  event_type text not null check (event_type in ('upload_reserved','upload_released','capacity_purchased','admin_adjustment')),
  delta_bytes bigint not null,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tenant_storage_events_tenant_created_idx
  on public.tenant_storage_events(tenant_id, created_at desc);

create or replace function public.ensure_tenant_storage_account()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.tenant_storage_accounts(tenant_id) values (new.id)
  on conflict (tenant_id) do nothing;
  return new;
end;
$$;

drop trigger if exists tenants_create_storage_account on public.tenants;
create trigger tenants_create_storage_account
after insert on public.tenants
for each row execute function public.ensure_tenant_storage_account();

insert into public.tenant_storage_accounts(tenant_id)
select id from public.tenants
on conflict (tenant_id) do nothing;

create or replace function public.reserve_media_upload(
  p_tenant_id uuid,
  p_media_type text,
  p_original_size_bytes bigint,
  p_idempotency_key text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_asset_id uuid;
begin
  if p_media_type not in ('image','video') or p_original_size_bytes <= 0
     or p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'INVALID_STORAGE_RESERVATION';
  end if;

  select id into v_asset_id from public.media_assets
  where tenant_id = p_tenant_id and idempotency_key = p_idempotency_key;
  if found then return v_asset_id; end if;

  insert into public.tenant_storage_accounts(tenant_id) values (p_tenant_id)
  on conflict (tenant_id) do nothing;

  update public.tenant_storage_accounts
  set used_bytes = used_bytes + p_original_size_bytes, updated_at = now()
  where tenant_id = p_tenant_id
    and used_bytes + p_original_size_bytes <= capacity_bytes;
  if not found then
    raise exception using errcode = 'P0001', message = 'STORAGE_CAPACITY_EXCEEDED';
  end if;

  insert into public.media_assets(tenant_id, media_type, idempotency_key, original_size_bytes)
  values (p_tenant_id, p_media_type, p_idempotency_key, p_original_size_bytes)
  returning id into v_asset_id;

  insert into public.tenant_storage_events(tenant_id, media_asset_id, event_type, delta_bytes, idempotency_key)
  values (p_tenant_id, v_asset_id, 'upload_reserved', p_original_size_bytes,
          'reserve:' || p_tenant_id::text || ':' || p_idempotency_key);
  return v_asset_id;
end;
$$;

create or replace function public.finalize_media_upload(
  p_asset_id uuid,
  p_tenant_id uuid,
  p_original_object_key text,
  p_optimized_manifest jsonb,
  p_optimized_size_bytes bigint,
  p_storage_footprint_bytes bigint
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.media_assets
  set status = 'active',
      original_object_key = p_original_object_key,
      optimized_manifest = coalesce(p_optimized_manifest, '{}'::jsonb),
      optimized_size_bytes = greatest(coalesce(p_optimized_size_bytes, 0), 0),
      storage_footprint_bytes = greatest(coalesce(p_storage_footprint_bytes, 0), 0),
      updated_at = now()
  where id = p_asset_id and tenant_id = p_tenant_id and status = 'pending';
  return found;
end;
$$;

create or replace function public.release_media_upload(
  p_asset_id uuid,
  p_tenant_id uuid,
  p_final_status text
) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_original_size bigint;
begin
  if p_final_status not in ('deleted','failed') then
    raise exception 'INVALID_MEDIA_RELEASE_STATUS';
  end if;

  update public.media_assets
  set status = p_final_status, quota_released_at = now(), updated_at = now()
  where id = p_asset_id and tenant_id = p_tenant_id
    and status in ('pending','active')
  returning original_size_bytes into v_original_size;

  if not found then return 0; end if;

  update public.tenant_storage_accounts
  set used_bytes = greatest(0, used_bytes - v_original_size), updated_at = now()
  where tenant_id = p_tenant_id;

  insert into public.tenant_storage_events(tenant_id, media_asset_id, event_type, delta_bytes, idempotency_key)
  values (p_tenant_id, p_asset_id, 'upload_released', -v_original_size, 'release:' || p_asset_id::text)
  on conflict (idempotency_key) do nothing;

  return v_original_size;
end;
$$;

create or replace function public.purchase_storage_capacity(
  p_tenant_id uuid,
  p_added_bytes bigint,
  p_payment_reference text
) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_inserted bigint;
  v_capacity bigint;
begin
  if p_added_bytes <= 0 or p_payment_reference is null or length(trim(p_payment_reference)) = 0 then
    raise exception 'INVALID_STORAGE_PURCHASE';
  end if;
  insert into public.tenant_storage_accounts(tenant_id) values (p_tenant_id)
  on conflict (tenant_id) do nothing;

  insert into public.tenant_storage_events(tenant_id, event_type, delta_bytes, idempotency_key, metadata)
  values (p_tenant_id, 'capacity_purchased', p_added_bytes, 'purchase:' || p_payment_reference,
          jsonb_build_object('payment_reference', p_payment_reference))
  on conflict (idempotency_key) do nothing
  returning delta_bytes into v_inserted;

  if v_inserted is not null then
    update public.tenant_storage_accounts
    set capacity_bytes = capacity_bytes + p_added_bytes, updated_at = now()
    where tenant_id = p_tenant_id;
  end if;

  select capacity_bytes into v_capacity from public.tenant_storage_accounts where tenant_id = p_tenant_id;
  return v_capacity;
end;
$$;

alter table public.tenant_storage_accounts enable row level security;
alter table public.tenant_storage_accounts force row level security;
drop policy if exists tenant_storage_account_isolation on public.tenant_storage_accounts;
create policy tenant_storage_account_isolation on public.tenant_storage_accounts
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;
drop policy if exists media_assets_tenant_isolation on public.media_assets;
create policy media_assets_tenant_isolation on public.media_assets
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

alter table public.tenant_storage_events enable row level security;
alter table public.tenant_storage_events force row level security;
drop policy if exists tenant_storage_events_isolation on public.tenant_storage_events;
create policy tenant_storage_events_isolation on public.tenant_storage_events
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

revoke all on function public.reserve_media_upload(uuid,text,bigint,text) from public;
revoke all on function public.finalize_media_upload(uuid,uuid,text,jsonb,bigint,bigint) from public;
revoke all on function public.release_media_upload(uuid,uuid,text) from public;
revoke all on function public.purchase_storage_capacity(uuid,bigint,text) from public;
