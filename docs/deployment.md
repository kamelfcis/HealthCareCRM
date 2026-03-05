# Deployment Guide

## 1) Backend deployment (VPS)

1. Provision Ubuntu server and install Node.js 20+, npm, and PM2.
2. Clone repo and install dependencies:
   - `npm install`
3. Configure `.env` with production values.
4. Build backend:
   - `npm run build --workspace backend`
5. Run migrations and seed:
   - `npm run db:migrate --workspace backend`
   - `npm run db:seed --workspace backend`
6. Start with PM2:
   - `pm2 start backend/dist/server.js --name healthcare-crm-api`
7. Put Nginx in front of backend and allow HTTPS with Certbot.

## 2) Frontend deployment (VPS)

1. Build frontend:
   - `npm run build --workspace frontend`
2. Start frontend:
   - `npm run start --workspace frontend`
3. Reverse proxy with Nginx to the frontend process.

## 3) Railway deployment

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

## 4) Database deployment

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

## 5) Production hardening checklist

- `helmet` enabled
- strict CORS origin list
- request rate limiting enabled
- JWT secrets are long and random
- database backups verified
- API logs and process monitoring enabled
