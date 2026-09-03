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

  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, "utf-8");
      try {
        await client.executeMultiple(sql);
        console.log(`  ✅ Applied: ${folder}`);
      } catch (err: any) {
        console.warn(`  ⚠️ Note on ${folder}:`, err.message);
      }
    }
  }

  console.log(`🎉 Migrations complete for: ${url}`);
}

async function run() {
  // Always apply to local database
  await applyMigrations(localUrl);

  // If Turso credentials provided, apply to Turso cloud database
  if (tursoUrl && tursoToken) {
    await applyMigrations(tursoUrl, tursoToken);
  }
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
