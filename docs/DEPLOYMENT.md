# Production Deployment & Database Guide

This guide details how to deploy PoD Engine to serverless platforms (such as **Vercel**) using a persistent cloud database (**Turso / LibSQL** or **PostgreSQL**).

---

## 1. Why SQLite Needs a Cloud Database for Serverless

In local development, PoD Engine uses local SQLite (`file:./dev.db`) powered by `@prisma/adapter-better-sqlite3`.

However, serverless functions on Vercel, Netlify, or AWS Lambda are stateless and ephemeral:
* Files written to the filesystem in serverless lambdas are destroyed between invocations.
* Native C++ bindings (like `better-sqlite3`) often cause architecture mismatch issues on serverless Linux runtimes.

To solve this, PoD Engine includes built-in support for **Turso (LibSQL)** via `@prisma/adapter-libsql`.

---

## 2. Option A: Turso (Recommended for Serverless Edge SQLite)

[Turso](https://turso.tech) is distributed SQLite that communicates over HTTP/WebSockets. It requires **zero schema changes** because it shares the same SQLite dialect already defined in `prisma/schema.prisma`.

### Step 1: Create a Turso Database
1. Install the Turso CLI (or use the web dashboard at [turso.tech](https://turso.tech)):
   ```bash
   # macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash

   # Windows (PowerShell)
   irm https://get.tur.so/install.ps1 | iex
   ```
2. Authenticate and create your database:
   ```bash
   turso auth login
   turso db create pod-engine
   ```
3. Retrieve your database connection URL and auth token:
   ```bash
   turso db show pod-engine --url
   # Output: libsql://pod-engine-[your-org].turso.io

   turso db tokens create pod-engine
   # Output: eyJhbGciOi... (your auth token)
   ```

### Step 2: Push Schema & Seed Initial Data
Run the following commands using your Turso credentials:
```bash
# Push schema to Turso
DATABASE_URL="libsql://pod-engine-[your-org].turso.io" TURSO_AUTH_TOKEN="your-token" npx prisma db push

# Seed demo user & experiment data into Turso
DATABASE_URL="libsql://pod-engine-[your-org].turso.io" TURSO_AUTH_TOKEN="your-token" npm run db:seed
```

---

## 3. Option B: PostgreSQL (Supabase, Neon, Railway, AWS RDS)

If you prefer PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Install the PostgreSQL adapter (if using Prisma driver adapters):
   ```bash
   npm install @prisma/adapter-pg pg @types/pg
   ```
3. Run migrations on your PostgreSQL instance:
   ```bash
   npx prisma migrate dev --name init_postgres
   npm run db:seed
   ```

---

## 4. Deploying to Vercel

### Step 1: Connect Repository
1. Push your code to GitHub (`origin/master`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
3. Import your `POD` repository.

### Step 2: Configure Environment Variables
In the Vercel project configuration, add the following environment variables:

| Variable | Description | Value |
|---|---|---|
| `DATABASE_URL` | Database Connection URL | `libsql://pod-engine-[org].turso.io` |
| `TURSO_AUTH_TOKEN` | Turso Auth Token | `eyJ...` (from `turso db tokens create`) |
| `AUTH_SECRET` | NextAuth v5 session encryption secret | Run `openssl rand -base64 32` |
| `AUTH_URL` | Canonical Production URL | `https://your-pod-app.vercel.app` |
| `AUTH_TRUST_HOST` | Trust Vercel proxy headers | `true` |
| `NEXT_PUBLIC_APP_URL` | App domain for redirects | `https://your-pod-app.vercel.app` |
| `OPENAI_API_KEY` | (Optional) For real AI Analyst streaming | `sk-...` |
| `STRIPE_SECRET_KEY` | (Optional) For live Stripe checkout | `sk_live_...` or `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (Optional) Stripe publishable key | `pk_live_...` or `pk_test_...` |

### Step 3: Deploy
* **Framework Preset:** Next.js
* **Root Directory:** `./`
* **Build Command:** `npm run build` *(The `postinstall: prisma generate` script automatically generates the Prisma client)*
* **Install Command:** `npm install`

Click **Deploy**!
