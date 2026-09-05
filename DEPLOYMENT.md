# 🚀 PoD (Proof of Demand) - Cloud Deployment Guide

This document outlines the step-by-step instructions for deploying Proof of Demand (PoD) to production using **Vercel** (Serverless + Turso LibSQL) or **Railway / Docker** (Containerized), along with a complete environment variable audit and smoke-test verification checklist.

---

## 🏗️ Architecture & Deployment Options

PoD is built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**.

| Target | Database | Best For | Build Mechanism |
| :--- | :--- | :--- | :--- |
| **Option A: Vercel (Recommended)** | Turso (Distributed SQLite / LibSQL) | Global edge performance, zero server maintenance, automatic PR previews. | `vercel.json` / `npm run build:vercel` |
| **Option B: Railway** | Railway Volume (SQLite) or Turso | Fast single-platform setup, persistent containers, full Node.js runtime. | `railway.json` / Nixpacks / `Dockerfile` |
| **Option C: Self-Hosted Docker** | Mounted SQLite volume or Turso | Private VPS, AWS ECS, DigitalOcean App Platform, Fly.io. | Multi-stage `Dockerfile` |

> ⚠️ **Important SQLite Consideration for Serverless (Vercel):**  
> Local SQLite files (`file:./dev.db`) are ephemeral in serverless lambda environments. For Vercel, you **must** use **Turso** (`libsql://...`), which PoD natively supports via `@prisma/adapter-libsql`. For Railway or self-hosted Docker, you can choose between persistent volume-mounted SQLite or Turso.

---

## 🌟 Option A: Vercel + Turso Deployment (Recommended)

### Step 1: Provision a Free Turso Database

1. Install the Turso CLI or visit [turso.tech](https://turso.tech):
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   # Log in
   turso auth login
   ```
2. Create your production database:
   ```bash
   turso db create pod-production
   ```
3. Retrieve your database URL and an authentication token:
   ```bash
   turso db show pod-production --url
   # Outputs: libsql://pod-production-[your-org].turso.io

   turso db tokens create pod-production
   # Outputs: eyJhbGci... (your TURSO_AUTH_TOKEN)
   ```

### Step 2: Push Prisma Schema to Turso

From your local terminal with the Turso credentials:
```bash
# In your local .env or inline:
DATABASE_URL="libsql://pod-production-[org].turso.io" TURSO_AUTH_TOKEN="your_token" npm run db:push:turso
```
Your Turso database tables (`User`, `Workspace`, `Campaign`, `Variant`, `Lead`, `Event`, `Webhook`, `AiAuditReport`) are now initialized.

### Step 3: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git push origin master
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository** -> Select your `POD` repo.
3. Configure Build Settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build` (defined in `vercel.json`)
   - **Install Command**: `npm install`
4. Add Environment Variables (see [Environment Variables Reference](#-environment-variables-reference)).
5. Click **Deploy**.

---

## 🚂 Option B: Railway Deployment

PoD includes a preconfigured `railway.json` and a production-grade multi-stage `Dockerfile`.

### Method 1: Using Railway Dashboard (One-Click)

1. Go to [railway.app](https://railway.app/new) -> **Deploy from GitHub repo**.
2. Select your `POD` repository.
3. Under **Settings** -> **Deploy**:
   - **Healthcheck Path**: `/api/health`
   - **Restart Policy**: `ON_FAILURE` (Max retries: 10)
4. Under **Variables**, add all required production environment variables.
   - If using Turso: set `DATABASE_URL="libsql://..."` and `TURSO_AUTH_TOKEN="..."`.
   - If using local SQLite: attach a Railway Volume mounted to `/app/prisma` and set `DATABASE_URL="file:/app/prisma/dev.db"`.
5. Railway will automatically build via `railway.json` and publish your live app domain (`https://pod-production.up.railway.app`).

---

## 🐳 Option C: Self-Hosted Docker

Build and run anywhere with Docker:

```bash
# 1. Build the production image
docker build -t pod-app:latest .

# 2. Run container with environment file
docker run -d \
  --name pod-app \
  -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/prisma-data:/app/prisma \
  pod-app:latest
```

The container runs as a non-root user (`nextjs:nodejs`), includes built-in health checking via `/api/health`, and serves on port `3000`.

---

## 🔑 Environment Variables Reference

Configure these variables in your Vercel / Railway / Docker environment:

### 1. Application & Domain
| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public URL of your deployed application (no trailing slash). | `https://pod.yourdomain.com` |
| `NODE_ENV` | Yes | Node execution mode. | `production` |
| `PORT` | Optional | Port for Docker / Railway runner (defaults to 3000). | `3000` |

### 2. Authentication (Clerk)
| Variable | Required | Description | Where to Find |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk Production Publishable Key. | [Clerk Dashboard](https://dashboard.clerk.com) -> API Keys |
| `CLERK_SECRET_KEY` | **Yes** | Clerk Production Secret Key. | Clerk Dashboard -> API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | **Yes** | Authentication sign-in path. | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | **Yes** | Authentication sign-up path. | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | **Yes** | Post-auth landing path. | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | **Yes** | Post-signup onboarding path. | `/dashboard` |

> 💡 **Production Clerk Domain**: In Clerk Dashboard -> **Domains**, add your custom production domain (`pod.yourdomain.com`) so user sessions cookie seamlessly.

### 3. Database (Turso LibSQL or Local SQLite)
| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Turso LibSQL URL (Vercel) or SQLite file path (Local/Railway Volume). | `libsql://pod-prod.turso.io` or `file:./dev.db` |
| `TURSO_AUTH_TOKEN` | Only for Turso | Secret JWT token for Turso authentication. | `eyJhbGciOi...` |

### 4. Billing & Monetization (Stripe)
| Variable | Required | Description | Where to Find |
| :--- | :---: | :--- | :--- |
| `STRIPE_SECRET_KEY` | **Yes** | Stripe Live Secret Key (`sk_live_...`). | [Stripe Dashboard](https://dashboard.stripe.com) -> API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Yes** | Stripe Live Publishable Key (`pk_live_...`). | Stripe Dashboard -> API Keys |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | Webhook endpoint secret for billing events (`whsec_...`). | Stripe Dashboard -> Webhooks -> Add Endpoint |
| `STRIPE_PRICE_ID_STARTER` | Optional | Stripe recurring Price ID for Starter tier. | Stripe Dashboard -> Products |
| `STRIPE_PRICE_ID_GROWTH` | Optional | Stripe recurring Price ID for Growth tier. | Stripe Dashboard -> Products |
| `STRIPE_PRICE_ID_ENTERPRISE` | Optional | Stripe recurring Price ID for Enterprise tier. | Stripe Dashboard -> Products |

> 💡 *Note: The billing engine accepts both `STRIPE_PRICE_ID_*` and `STRIPE_PRICE_*` aliases.*

### 5. AI Reasoning & Generation (Any or All)
| Variable | Required | Description | Where to Find |
| :--- | :---: | :--- | :--- |
| `OPENAI_API_KEY` | Optional | For GPT-4o / AI Analyst synthesis. | [OpenAI Platform](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | Optional | For Claude 3.5 Sonnet landing page generation. | [Anthropic Console](https://console.anthropic.com) |
| `GROQ_API_KEY` | Optional | For ultra-fast Llama-3 pitch generation. | [Groq Console](https://console.groq.com) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | For Gemini 1.5 Pro deep research. | [Google AI Studio](https://aistudio.google.com) |

---

## 📡 Webhook Setup (Stripe & Integrations)

### 1. Stripe Inbound Webhook
1. In the **Stripe Dashboard** -> **Developers** -> **Webhooks**, click **Add an endpoint**.
2. **Endpoint URL**: `https://pod.yourdomain.com/api/webhooks/stripe`
3. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (`whsec_...`) and paste it as `STRIPE_WEBHOOK_SECRET` in your hosting provider's environment variables.

### 2. Outbound Lead Dispatch (Zapier, Slack, Make)
PoD dispatches an asynchronous HTTP POST webhook every time a visitor converts on a landing page (`/api/track`):
- **Header**: `X-PoD-Event: lead.captured`
- **Payload**:
  ```json
  {
    "event": "lead.captured",
    "timestamp": "2026-09-04T22:30:00.000Z",
    "lead": {
      "id": "cly...",
      "email": "lead@example.com",
      "intentScore": 85,
      "source": "landing_page",
      "variantId": "cly..."
    }
  }
  ```
Configure destination webhook URLs in **Dashboard** -> **Integrations & Webhooks**.

---

## 🩺 Post-Deployment Smoke Test Checklist

Once your deployment is live, run through this 5-minute sanity test:

- [ ] **1. Health Check Endpoint**:
  ```bash
  curl -i https://pod.yourdomain.com/api/health
  # Expected Response: HTTP 200 OK with {"status":"healthy","database":"connected",...}
  ```
- [ ] **2. Authentication Flow**:
  - Visit `https://pod.yourdomain.com/sign-in`
  - Sign in with an admin or test account
  - Confirm redirect lands cleanly on `/dashboard`
- [ ] **3. Demo Seeder Verification**:
  - On `/dashboard`, click **"Load Demo Dataset"**
  - Verify metrics cards update (Demand Score, Views, Leads, Conversion Rate)
- [ ] **4. Public Landing Page**:
  - Navigate to any campaign public link: `https://pod.yourdomain.com/p/[campaign-slug]`
  - Verify OG social card tags and layout render with 0 client-side errors
  - Submit an email into the lead form; confirm the success state appears
- [ ] **5. Lead CRM & CSV Download**:
  - Open `/dashboard/leads`
  - Verify the newly submitted lead appears with its computed intent score
  - Click **"Export CSV"** and verify that `pod-leads-[timestamp].csv` downloads properly
- [ ] **6. Billing Portal / Checkout**:
  - Visit `/dashboard/billing`
  - Click **"Upgrade to Growth"**; confirm redirection to Stripe Checkout with your configured live price.

---

🎉 **Congratulations! Your Proof of Demand platform is live in production!**
