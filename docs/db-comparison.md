# Database Comparison: Prisma vs Supabase for PoD Engine

## TL;DR

| Criteria | Prisma + SQLite | Supabase |
|---|---|---|
| **Setup time** | ~30 min | ~15 min (hosted) / ~45 min (self-host) |
| **Local dev** | Zero-config (file DB) | Needs Docker or cloud project |
| **Cost (MVP)** | Free (self-hosted) | Free tier (500MB, 50K rows) |
| **Scaling path** | Swap SQLite → Postgres/MySQL | Built-in Postgres, auto-scales |
| **Auth** | BYO (Clerk/NextAuth) | Built-in (GoTrue) |
| **Realtime** | BYO (Pusher/Ably) | Built-in (Postgres CDC) |
| **Type safety** | Excellent (generated client) | Good (auto-generated types) |
| **Vendor lock-in** | Low (standard SQL) | Medium (Supabase-specific APIs) |
| **Best for** | Solo/small team, rapid iteration | Teams wanting BaaS, realtime, auth |

---

## Option A: Prisma + SQLite → Postgres

### How it works
1. Define schema in `prisma/schema.prisma`
2. `npx prisma migrate dev` generates SQL + typed client
3. SQLite for local dev, swap to Postgres for production

### Pros
- **Zero infrastructure** for development — just a file
- **Best-in-class type safety** — generated client matches your schema exactly
- **Framework-agnostic** — works with any Node.js backend
- **Easy migration path** — change one line to switch from SQLite to Postgres
- **Full control** over queries, indexes, and schema
- **No vendor lock-in** — standard SQL underneath

### Cons
- Need to handle auth separately (Clerk, NextAuth, etc.)
- No built-in realtime — need Pusher/Ably/SSE
- Need to manage your own database hosting in production
- Migrations require CLI usage

### Schema preview
```prisma
model LandingPage {
  id             String   @id
  projectId      String
  name           String
  template       String
  headline       String
  subheadline    String
  cta            String
  positioning    String
  status         String   @default("draft")
  experimentId   String?
  slug           String   @unique
  visitors       Int      @default(0)
  conversions    Int      @default(0)
  conversionRate Float    @default(0)
  bounceRate     Float    @default(0)
  avgTimeOnPage  Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  experiment     Experiment? @relation(fields: [experimentId], references: [id])
  project        Project     @relation(fields: [projectId], references: [id])

  @@index([projectId])
  @@index([experimentId])
  @@index([status])
}
```

### Effort to integrate
- `npm install prisma @prisma/client` → 5 min
- Write schema → 15 min
- Run migration → 2 min
- Replace Zustand store calls with Prisma client → 30 min
- **Total: ~50 min**

---

## Option B: Supabase

### How it works
1. Create project at supabase.com (or self-host with Docker)
2. Define tables via dashboard UI or SQL migrations
3. Use `@supabase/supabase-js` client in Next.js

### Pros
- **All-in-one** — Postgres + Auth + Realtime + Storage + Edge Functions
- **Generous free tier** — 500MB DB, 1GB storage, 50K monthly active users
- **Built-in auth** — replaces Clerk/NextAuth
- **Realtime subscriptions** — live dashboard updates without extra infra
- **Auto-generated TypeScript types** from your schema
- **Row Level Security** — fine-grained access control at the DB level
- **Dashboard UI** — manage data, auth, and storage visually

### Cons
- **Vendor lock-in** — Supabase-specific APIs (though Postgres underneath)
- **Free tier limits** — 500MB DB, pauses after 1 week of inactivity
- **Cold starts** on free tier — first request after idle is slow
- **Learning curve** — RLS policies, Edge Functions, etc.
- **Network dependency** — local dev requires cloud project or Docker

### Effort to integrate
- Create Supabase project → 5 min
- `npm install @supabase/supabase-js` → 2 min
- Create tables via SQL → 10 min
- Set up auth → 20 min
- Replace Zustand store calls → 30 min
- **Total: ~65 min** (but you get auth + realtime for free)

---

## Recommendation

### For PoD Engine right now: **Prisma + SQLite**

**Why:**
1. **You're in MVP/validation phase** — speed matters more than features
2. **Zero infra overhead** — SQLite file lives in your repo, no cloud setup
3. **Fastest path to persistence** — schema → migrate → done
4. **Clean upgrade path** — one config change to Postgres when you need to scale
5. **No vendor lock-in** — you're still exploring your stack

### When to switch to Supabase
- You need **auth** (and don't want to add Clerk separately)
- You need **realtime** dashboard updates
- You're ready to **ship to users** and need managed infrastructure
- You want **Row Level Security** for multi-tenant access

### Migration path
```
Phase 1 (now):     Prisma + SQLite        → local dev, fast iteration
Phase 2 (beta):    Prisma + Postgres       → Vercel Postgres or Railway
Phase 3 (scale):   Supabase or Neon        → managed Postgres + auth + realtime
```

---

## Quick Start: Prisma + SQLite

```bash
# Install
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite

# Define schema in prisma/schema.prisma (see above)

# Migrate
npx prisma migrate dev --name init
npx prisma generate

# Use in API routes
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const pages = await prisma.landingPage.findMany();
```
