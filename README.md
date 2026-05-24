# Bill Desk

Bill Desk is a premium multi-business bill generation and inventory management software concept built with Next.js, Tailwind CSS, Framer Motion, Zustand, Prisma, and PostgreSQL.

## Included in this scaffold
- Responsive authentication flows for owner, cashier, accountant, and admin roles
- Premium dashboard with charts, live metrics, low-stock alerts, transactions, and AI insight cards
- Billing counter with searchable products, direct customer entry, GST calculation, QR payment, printable invoices, and PDF invoice download
- Inventory, customers, reports, admin console, and operations settings modules
- Prisma database schema for multi-shop, inventory, invoices, CRM, expenses, subscriptions, notifications, and audit logs
- REST API scaffold for auth, billing, inventory, reports, and provider-based invoice sharing
- Production-oriented PDF sharing path for email and WhatsApp

## Run locally
1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Start the app with `npm run dev`

## Deploy
- Render deployment is configured in `render.yaml`.
- Full deployment steps are in `DEPLOYMENT.md`.
- Use Render for the current version so signup and forgot-password data persists on a mounted disk.

## Provider setup for real invoice sending
### Email PDF sending
- Add `RESEND_API_KEY`
- Add `RESEND_FROM_EMAIL`
- The app will send the invoice PDF from `/api/notifications/email`

### WhatsApp PDF sending
- Add `TWILIO_ACCOUNT_SID`
- Add `TWILIO_AUTH_TOKEN`
- Add `TWILIO_WHATSAPP_FROM`
- Add `SHARE_SIGNING_SECRET`
- Set `NEXT_PUBLIC_APP_URL` to your real deployed HTTPS domain
- The app will send the invoice PDF from `/api/notifications/whatsapp`

Important: WhatsApp media delivery does not work from `localhost` because Twilio needs a public URL to fetch the PDF attachment.

## Suggested next implementation steps
1. Connect the Prisma schema to a real PostgreSQL database and run migrations.
2. Replace mocked dashboards and route handlers with database queries and services.
3. Move invoice storage from browser state to the database so shared PDF links come from persistent records.
4. Add role-based middleware, OTP delivery, offline sync, background jobs, and provider retry logs.
