import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import "dotenv/config";

const tursoUrl = (process.env.TURSO_DATABASE_URL || "").trim();
const tursoToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
const localUrl = (process.env.DATABASE_URL || "file:./dev.db").trim();

async function applyMigrations(url: string, authToken?: string) {
  console.log(`\nConnecting to database: ${url}...`);
  const client = authToken ? createClient({ url, authToken }) : createClient({ url });
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  console.log(`Applying ${folders.length} migrations...`);

  const failed: string[] = [];
  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, "utf-8");
      try {
        await client.executeMultiple(sql);
        console.log(`  ✅ Applied: ${folder}`);
      } catch (err: any) {
        // Fail loudly on genuine errors: a silently skipped migration is how
        // production drifts out of sync with the schema.
        // Benign rerun cases are skipped: this script is intentionally
        // re-runnable (Vercel build + container start), and old migrations
        // use plain CREATE TABLE / ADD COLUMN, so "already exists" and
        // "duplicate column" just mean the objects are already there
        // (e.g. dev databases previously synced via `prisma db push`).
        const msg = err.message || "";
        if (/already exists|duplicate column/i.test(msg)) {
          console.warn(`  ⚠️ Skipped (already applied): ${folder}:`, msg);
          continue;
        }
        console.error(`  ❌ Failed: ${folder}:`, msg);
        failed.push(folder);
      }
    }
  }

  if (failed.length > 0) {
    throw new Error(`Migration failures in ${url}: ${failed.join(", ")}`);
  }

  console.log(`🎉 Migrations complete for: ${url}`);
}

async function run() {
  // Single effective target: an explicit Turso URL wins over DATABASE_URL, and
  // the token is always attached when present. (Previously the DATABASE_URL
  // pass ran without the token, so a Turso DATABASE_URL 401'd and aborted
  // before the authenticated pass ever ran.)
  const primary = tursoUrl || localUrl;
  await applyMigrations(primary, tursoToken || undefined);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
