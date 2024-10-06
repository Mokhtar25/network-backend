import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import db from "./";
// This will run migrations on the database, skipping the ones already applied
//
export async function migrateDB() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
