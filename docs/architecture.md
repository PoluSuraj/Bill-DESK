# Bill Desk Architecture

## Product scope
- Multi-business billing and inventory system for grocery, clothing, electronics, medical, hardware, restaurant, and hybrid retail shops.
- Roles: owner, cashier, accountant, plus super admin for subscriptions and platform oversight.
- Supports multi-shop and multi-branch operations with cloud backup and offline sync strategy.

## Frontend
- Next.js App Router with TypeScript for app structure and route-level loading.
- Tailwind CSS for the premium UI system with glassmorphism panels, motion-friendly spacing, and responsive grids.
- Framer Motion for animated cards, counters, transitions, and interactions.
- Zustand for billing cart state and fast local counter operations.
- Recharts / Chart.js for dashboards and business analytics.

## Backend
- Next.js route handlers currently scaffold the REST surface and can be replaced with a dedicated Express service if desired.
- JWT auth for stateless sessions, OTP/email verification, password reset, and role-aware middleware.
- PostgreSQL with Prisma for transactional data consistency across inventory, invoicing, ledgers, attendance, audit logs, and subscriptions.
- File/object storage for product images, shop logos, and invoice PDFs.

## Recommended modules
1. `auth-service`
2. `billing-service`
3. `inventory-service`
4. `crm-service`
5. `reporting-service`
6. `platform-service`

## Deployment blueprint
- Frontend: Vercel or self-hosted Next.js server.
- API and workers: Node.js runtime with background jobs for exports, notifications, and sync reconciliation.
- Database: Managed PostgreSQL.
- Cache and queues: Redis for sessions, OTP throttling, job queues, and offline sync diffs.
- Storage: S3-compatible bucket for media and archived invoices.

## Offline strategy
- Cache catalog, customer, and recent invoice state locally in IndexedDB.
- Queue pending invoices and stock mutations when offline.
- Reconcile on reconnect using branch-aware conflict rules and audit logs.
