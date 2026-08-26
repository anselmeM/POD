# PoD Engine

**Proof of Demand** — AI-powered demand validation for founders.

PoD Engine helps founders validate product ideas before writing a single line of code. Run experiments, collect signals, and get AI-driven insights to prove demand.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Database | SQLite via Prisma 7 |
| Charts | Recharts 3 |
| Animation | Framer Motion 13 |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/anselmeM/POD.git
cd POD

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize the database
npx prisma migrate dev

# Seed the database with demo data
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:reset` | Reset and re-seed database |

## Project Structure

```
├── app/
│   ├── api/            # API routes (experiments, leads, signals, etc.)
│   ├── dashboard/      # Dashboard pages (experiments, leads, signals, AI analyst)
│   ├── onboarding/     # 6-step onboarding wizard
│   ├── p/[slug]/       # Public landing page previews
│   ├── pricing/        # Pricing page
│   └── sign-in/up/     # Auth pages
├── components/
│   ├── marketing/      # Landing page components
│   └── ui/             # Reusable UI components
├── lib/
│   ├── store.ts        # Zustand stores
│   ├── prisma.ts       # Prisma client
│   ├── types.ts        # TypeScript types
│   └── mock-data.ts    # Demo data
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Database seeder
│   └── migrations/     # Database migrations
└── tests/              # Test suite
```

## Features

- **Onboarding Wizard** — 6-step guided setup for new experiments
- **Experiments** — Create, manage, and track demand validation experiments
- **Landing Pages** — Build and publish landing pages to test demand
- **Leads** — Capture and manage leads with intent scoring
- **Signals** — Track funnel events and conversion signals
- **AI Analyst** — Get AI-powered insights on experiment performance
- **Reports** — Generate demand validation reports with PoD scores
- **Sprint Mode** — Time-boxed experiment sprints with progress tracking

## Current Status

- 55/55 tasks completed
- Phase 1 (Core Data Layer) — 10/10 done
- Phase 2 (Auth & Multi-Tenancy) — 4/4 done
- Phase 3 (Features) — 8/8 done
- Phase 4 (Polish) — 8/8 done
- Tests — 3/3 done
- 14 test files, 89 tests passing + 2 Playwright E2E suites

See [TASKS.md](TASKS.md) for the full task list and [ROADMAP.md](ROADMAP.md) for the product roadmap.

## License

Private — All rights reserved.