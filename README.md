# BlueHaven Commerce (BHS)

A multi-tenant commerce platform foundation for up to ten independent storefronts, built as a modular Next.js application.

## Current phase
- Master control centre visual foundation
- Responsive overview dashboard
- Storefront network overview with searchable demo tenant records
- Initial application structure for Vercel deployment

## Planned architecture
- Next.js App Router + TypeScript
- PostgreSQL (Neon) with tenant-aware schema and Row-Level Security
- Server-side authorization on every tenant operation
- Secure, tenant-scoped sessions
- Subscription lifecycle and payment webhooks
- Wildcard subdomain routing after a production domain is connected

## Security principles
Tenant identity must be resolved and verified on the server. Client-supplied tenant IDs and middleware headers are never authorization evidence. Every data query and mutation must be scoped to the authenticated tenant, with PostgreSQL RLS as a second enforcement layer.

## Local development
```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when configuring integrations. Never commit secrets.

## Environment variables (planned)
- `DATABASE_URL`
- `SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Roadmap
1. Database schema, tenant model and RLS policies
2. Master owner authentication and tenant provisioning
3. Brand admin authentication and tenant-scoped authorization
4. Product catalogue, inventory and order workflows
5. Subscription billing, webhook verification and access gating
6. Audit log, soft deletion and recovery
7. Wildcard domain routing and production hardening

Demo dashboard figures are illustrative only and are not connected to a live database or payment provider.
## Storage capacity rules

Storage is a persistent usage meter against a capacity ceiling:
- Each tenant receives 2 GiB of included capacity. It does not accumulate or reset monthly.
- The platform owner can configure monthly storage add-on plans (for example, +1 GiB/month or +5 GiB/month), their prices, and availability.
- A tenant receives add-on capacity only while its paid subscription period is active. Capacity expires at the end of that period unless renewed.
- If an add-on expires while usage is above the remaining capacity, files are retained and remain accessible, but new uploads are blocked until usage is below the active capacity or the add-on is renewed.
- Upload reservations count the original uploaded byte size, even when image derivatives are compressed.
- Deleting a file releases its original upload size exactly once.
- The database records add-on billing periods and payment references; payment webhook verification must be the only route that activates or renews paid add-ons.

The schema migration is `database/migrations/002_storage_capacity.sql`; monthly add-ons are introduced by `database/migrations/003_monthly_storage_addons.sql`. Server-side helpers are in `lib/storage-quota.ts` and `lib/tenant-media.ts`.

**Admin integration status:** the database now supports monthly add-on plans and tenant subscriptions. The existing master dashboard is still a visual foundation with illustrative demo records; its master-owner authentication and secure plan-management UI/API are not implemented yet. I will not expose unauthenticated admin controls or pretend the current dashboard changes are persisted. Authenticated upload/delete routes, payment webhooks, tenant-facing quota display, and admin controls still need to be wired before this is production-ready.
