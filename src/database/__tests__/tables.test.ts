import { test, expect, beforeAll, afterAll } from "bun:test";
import db, { pool } from "../index";
import { users } from "../schemas";
import { migrateDB } from "../migrate";
import { seedDb } from "../seeding";
import { checkPassword } from "../../lib/auth/authUtils";
beforeAll(async () => {
  await migrateDB();
  await seedDb(db);
});

afterAll(async () => {
  await pool.end();
});

test("users table is rested and seed with users for testing", async () => {
  const data = await db.select().from(users);

  console.log(data);
  expect(data).toBeArray();
  expect(data[0].id).toEqual(1);
  expect(data[0].role).toEqual("user");
  expect(data[0].username).toEqual("test0");
  expect(await checkPassword("test", data[0].password!)).toBeTrue();
  expect(data[2].username).toEqual("test2");
  expect(data.length).toEqual(4);
});
