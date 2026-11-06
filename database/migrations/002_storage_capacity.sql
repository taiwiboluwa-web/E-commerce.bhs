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
