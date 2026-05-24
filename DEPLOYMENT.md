# Bill Desk Deployment

## Recommended Host: Render

This build includes password authentication, signup, forgot-password reset tokens, and a 12-hour `HttpOnly` session cookie.

Render is recommended for the current version because user accounts are stored in a local JSON file. The included `render.yaml` mounts a persistent disk at `/var/data` and sets `AUTH_DATA_DIR=/var/data/billdesk` so signup and password reset data survives restarts.

## GitHub

1. Create a GitHub repository under `PoluSuraj-Github`.
2. Push this project folder to that repository.
3. Connect the same repository in Render.

## Render Setup

1. Open Render and choose `New` > `Blueprint`.
2. Connect the GitHub repository.
3. Render will read `render.yaml`.
4. Set these environment variables in Render:
   - `NEXT_PUBLIC_APP_URL`: your Render app URL, for example `https://bill-desk.onrender.com`
   - `SOFTWARE_ADMIN_PASSWORD`: a strong private administrator password
   - Optional provider keys for invoice sending: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`

`JWT_SECRET` and `SHARE_SIGNING_SECRET` are generated automatically by the Render blueprint.

## Vercel Note

Vercel can host the UI, but this current JSON-file authentication store is not durable on serverless filesystem storage. Use Render for this version, or connect PostgreSQL/Prisma before deploying to Vercel.
