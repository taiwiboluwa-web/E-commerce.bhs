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
