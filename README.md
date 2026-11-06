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

Storage is a persistent capacity ceiling, not a monthly upload credit:
- Each new tenant receives 2 GiB of included capacity. Month 6 is still 2 GiB, not 12 GiB.
- Upload reservations count the original uploaded byte size, even when image derivatives are compressed.
- A full tenant is blocked from reserving another upload until files are deleted or capacity is purchased.
- A deletion releases the original upload size exactly once. Failed reservations can also be released.
- A verified storage purchase adds permanent capacity and is idempotent by payment reference; it does not reset usage.
- The database separately records optimised derivative bytes and total physical media footprint.

The database migration is `database/migrations/002_storage_capacity.sql`. The server-side accounting helpers are in `lib/storage-quota.ts` and `lib/tenant-media.ts`. Call these helpers only from a server route after resolving the tenant from a verified session. Do not accept tenant IDs from browser input.

**Integration status:** the storage schema and accounting functions are deployed to Neon, and the image optimisation/quota orchestration helpers are in the repository. The project still needs its authenticated upload/delete API routes and tenant-facing storage UI wired to these helpers. The current image pipeline is not a 100 MB direct-upload endpoint; Vercel's request-body limits require a direct-to-object-storage upload flow for that size. Video transcoding is not implemented yet.
