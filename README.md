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