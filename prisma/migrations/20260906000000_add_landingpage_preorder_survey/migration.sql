-- Add missing LandingPage preorder / survey columns (schema drift: added via `db push` but never captured in a migration).
-- Fresh databases created via `migrate deploy` (or scripts/push-turso.ts) were missing these columns,
-- causing: `no such column: main.LandingPage.preorderEnabled` on POST /api/landing-pages (60-second smoke test).
ALTER TABLE "LandingPage" ADD COLUMN "preorderEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LandingPage" ADD COLUMN "depositAmount" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "LandingPage" ADD COLUMN "priceAnchor" INTEGER NOT NULL DEFAULT 4900;
ALTER TABLE "LandingPage" ADD COLUMN "surveyEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "LandingPage" ADD COLUMN "surveyQuestions" TEXT NOT NULL DEFAULT '[]';

-- Add missing Lead preorder columns (same drift as above).
ALTER TABLE "Lead" ADD COLUMN "isPreorder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "depositAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Lead" ADD COLUMN "stripeSessionId" TEXT;

-- Add missing Workspace ad-pixel columns (present in schema.prisma, never migrated).
ALTER TABLE "Workspace" ADD COLUMN "metaPixelId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "googleAdsId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "linkedinPartnerId" TEXT;
