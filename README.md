# BlueHaven Commerce (BHS)

A multi-tenant commerce platform foundation for up to ten independent storefronts, built as a modular Next.js application.

## Current phase
- Premium responsive BlueHaven Studios control-centre interface
- Searchable module navigation and dedicated views for platform sections
- Glassmorphism visual system with reduced-motion support
- Honest live-data empty states; no seeded tenant, order, customer, payment or analytics records
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

The dashboard does not fabricate operational metrics. Modules without a verified backend connection show an explicit connection state rather than sample records.
## Storage capacity rules

Storage is a persistent usage meter against a capacity ceiling:
- Each tenant receives 2 GiB of included capacity. It does not accumulate or reset monthly.
- The platform owner can configure monthly storage add-on plans (for example, +1 GiB/month or +5 GiB/month), their prices, and availability.
- A tenant receives add-on capacity only while its paid subscription period is active. Capacity expires at the end of that period unless renewed.
- If an add-on expires while usage is above the remaining capacity, files are retained and remain accessible, but new uploads are blocked until usage is below the active capacity or the add-on is renewed.
- Upload reservations count the original uploaded byte size, even when image derivatives are compressed.
- Deleting a file releases its original upload size exactly once.
- The database records add-on billing periods and payment references; payment webhook verification must be the only route that activates or renews paid add-ons.

The base schema is `database/migrations/002_storage_capacity.sql`; expiring monthly add-ons and effective-capacity enforcement are introduced by `database/migrations/003_monthly_storage_addons.sql`. Server-side helpers are in `lib/storage-quota.ts` and `lib/tenant-media.ts`.

**Admin integration status:** the database now supports monthly add-on plans and tenant subscriptions. The existing master dashboard is still a visual foundation with illustrative demo records; its master-owner authentication and secure plan-management UI/API are not implemented yet. I will not expose unauthenticated admin controls or pretend the current dashboard changes are persisted. Authenticated upload/delete routes, payment webhooks, tenant-facing quota display, and admin controls still need to be wired before this is production-ready.


## Interface design principles

The control centre applies the ten requested mathematical ideas as practical design and engineering constraints—not as decorative labels in the UI:

1. **Homomorphism** — translate platform state into interface state without changing its meaning.
2. **Isomorphism** — keep equivalent navigation, module headers, status treatments and responsive views structurally consistent.
3. **Endomorphism** — keep local interactions, such as changing the active module or filtering navigation, within the same interface system.
4. **Automorphism** — make reversible interface actions (open/close navigation, dialogs and selections) return to a coherent prior state.
5. **Monomorphism** — preserve unique module identity and avoid ambiguous navigation destinations.
6. **Epimorphism** — ensure each visible navigation destination resolves to a real view, including honest unavailable states.
7. **Bimorphism** — keep the module-to-view mapping one-to-one and complete across the navigation system.
8. **Homeomorphism** — preserve the same information architecture as the layout reflows between desktop, tablet and mobile.
9. **Diffeomorphism** — use continuous, restrained transitions for navigation, hover and responsive state changes, with reduced-motion preferences respected.
10. **Linear transformation** — scale spacing, typography and layout proportions predictably across viewport sizes.

These principles guide implementation quality; they do not imply that unimplemented backend services are operational.


## Master workspace implementation (2026-11)
- Dedicated module data service at `/api/workspace` protected by a server-only `BHS_MASTER_ADMIN_KEY` and an HttpOnly, SameSite=Strict session cookie.
- Live read models for tenants, products, orders, derived customers, subscriptions, verified payment ledger entries, platform feature controls, settings and audit events.
- Platform-owner actions for tenant provisioning, storefront URL/status changes, product creation/publication/stock, order status, feature catalogue switches and persisted platform settings.
- Additive migration `database/migrations/004_master_workspace.sql` adds tenant storefront URLs, feature-control storage, platform settings and a verified payment ledger. Existing records are not removed.
- Payment entries are read-only and must originate from a verified payment-provider webhook. Subscription lifecycle remains provider-authoritative. Feature controls are stored but require tenant-facing enforcement before they can be treated as active product entitlements.
- Set `BHS_MASTER_ADMIN_KEY` and `DATABASE_URL` in Vercel Production and Preview before unlocking the master workspace. Never expose the key with a `NEXT_PUBLIC_` prefix.
