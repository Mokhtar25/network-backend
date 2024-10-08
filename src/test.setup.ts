import { beforeAll, afterAll } from "bun:test";
import db, { pool } from "./database";
import { migrateDB } from "./database/migrate";
import { seedDb } from "./database/seeding";

beforeAll(async () => {
  await migrateDB();
  await seedDb(db);
});

afterAll(async () => {
  await pool.end();
});
