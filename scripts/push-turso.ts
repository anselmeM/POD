import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import "dotenv/config";

const url = (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "").trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();

if (!url || !authToken) {
  console.error("Error: DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
  process.exit(1);
}

async function run() {
  const client = createClient({ url, authToken });
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  console.log(`Applying ${folders.length} migrations to Turso: ${url}`);

  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, "utf-8");
      await client.executeMultiple(sql);
      console.log(`  ✅ Applied: ${folder}`);
    }
  }

  console.log("🎉 All tables created in Turso successfully!");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
