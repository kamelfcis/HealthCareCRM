# Deployment Guide

## 1) Windows VPS + PM2 (no port conflict)

This setup uses:

- Backend API: `5000`
- Frontend Next.js: `3001`

So it does not conflict with apps already running on `3000` or `4000`.

### Step-by-step

1. Install prerequisites on VPS:
   - Node.js 20+
   - Git
   - PM2 (`npm install -g pm2`)
2. Clone repository:
   - `git clone https://github.com/kamelfcis/HealthCareCRM.git`
   - `cd HealthCareCRM`
3. Install dependencies:
   - `npm install`
4. Create production env files:
   - Copy root env template:
     - `copy .env.example .env`
   - Copy frontend env template:
     - `copy apps\frontend\.env.production.example apps\frontend\.env.production`
5. Edit `.env` with real secrets and URLs:
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN` (include your frontend URL)
6. Build project:
   - `npm run build`
7. Apply database migrations:
   - `npm run db:migrate --workspace backend`
8. Optional seed:
   - `npm run db:seed --workspace backend`
9. Start both apps with PM2:
   - `pm2 start ecosystem.config.cjs`
10. Save PM2 process list:
    - `pm2 save`
11. Verify:
    - `pm2 list`
    - `pm2 logs healthcare-backend`
    - `pm2 logs healthcare-frontend`

### Update deployment after new push

1. `git pull origin main`
2. `npm install`
3. `npm run build`
4. `npm run db:migrate --workspace backend`
5. `pm2 restart ecosystem.config.cjs`

## 2) Railway deployment

### Backend service

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment variables: all required keys from `docs/environment.md`

### Frontend service

- Root directory: `apps/frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Set `NEXT_PUBLIC_API_BASE_URL` to backend public URL + `/api`

## 3) Database deployment

### SQLite (default)

- Local and lightweight deployments can keep SQLite with:
  - `DATABASE_URL="file:./prisma/dev.db"`
- Persist `backend/prisma/dev.db` on durable disk (not ephemeral containers).
- Back up the SQLite file regularly.

### PostgreSQL (optional for scale)

Options:
- Managed: Supabase Postgres / Railway Postgres / Neon
- Self-hosted: Dockerized PostgreSQL on VPS

Minimum checklist:

- Enable daily backups
- Restrict ingress by IP/security group
- Use SSL-enabled connection URLs
- Rotate DB credentials per environment

## 4) Production hardening checklist

- `helmet` enabled
- strict CORS origin list
- request rate limiting enabled
- JWT secrets are long and random
- database backups verified
- API logs and process monitoring enabled
