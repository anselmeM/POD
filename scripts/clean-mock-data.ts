import { createClient } from "@libsql/client";
import "dotenv/config";

const tursoUrl = (process.env.TURSO_DATABASE_URL || "").trim();
const tursoToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
const localUrl = (process.env.DATABASE_URL || "file:./dev.db").trim();

async function cleanDatabase(url: string, authToken?: string) {
  console.log(`\nConnecting to clean: ${url}...`);
  const client = authToken ? createClient({ url, authToken }) : createClient({ url });

  // Delete demo and test projects (and cascading relations)
  const statements = [
    // Delete signal events from demo experiments
    `DELETE FROM "SignalEvent" WHERE "experimentId" IN ('EXP-2048', 'EXP-2041', 'EXP-2035') OR "experimentId" LIKE 'exp-%';`,
    // Delete leads from demo experiments
    `DELETE FROM "Lead" WHERE "experimentId" IN ('EXP-2048', 'EXP-2041', 'EXP-2035') OR "experimentId" LIKE 'exp-%';`,
    // Delete AI insights from demo experiments
    `DELETE FROM "AIInsight" WHERE "experimentId" IN ('EXP-2048', 'EXP-2041', 'EXP-2035') OR "experimentId" LIKE 'exp-%';`,
    // Delete variants
    `DELETE FROM "Variant" WHERE "experimentId" IN ('EXP-2048', 'EXP-2041', 'EXP-2035') OR "experimentId" LIKE 'exp-%';`,
    // Delete landing pages from demo projects
    `DELETE FROM "LandingPage" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%';`,
    // Delete audience segments & audience
    `DELETE FROM "AudienceSegment" WHERE "audienceId" IN (SELECT "id" FROM "Audience" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%');`,
    `DELETE FROM "Audience" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%';`,
    // Delete AI conversations
    `DELETE FROM "AIMessage" WHERE "conversationId" IN (SELECT "id" FROM "AIConversation" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%');`,
    `DELETE FROM "AIConversation" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%';`,
    // Delete experiments
    `DELETE FROM "Experiment" WHERE "projectId" = 'proj-001' OR "projectId" LIKE 'cmtk%';`,
    // Delete projects
    `DELETE FROM "Project" WHERE "id" = 'proj-001' OR "id" LIKE 'cmtk%';`,
  ];

  for (const sql of statements) {
    try {
      await client.execute(sql);
    } catch (e: any) {
      console.warn(`  Warning executing: ${sql.slice(0, 30)}...: ${e.message}`);
    }
  }

  console.log(`✅ Demo and test mock data completely purged from: ${url}`);
}

async function run() {
  await cleanDatabase(localUrl);

  if (tursoUrl && tursoToken) {
    await cleanDatabase(tursoUrl, tursoToken);
  }
}

run().catch((err) => {
  console.error("Clean error:", err);
  process.exit(1);
});
