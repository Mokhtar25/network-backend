import { test, expect, beforeAll, afterAll } from "bun:test";
import db, { pool } from "../index";
import { users } from "../schemas";
import { migrateDB } from "../migrate";
import { turbTable } from "../seeding";
beforeAll(async () => {
  await migrateDB();

  await Promise.all([turbTable(db, users)]);

  //await Promise.all([
  //  db
  //    .insert(users)
  //    .values({ username: "test1", provider: "local", password: "test" }),
  //
  //  db
  //    .insert(users)
  //    .values({ username: "test2", provider: "local", password: "test" }),
  //
  //  db
  //    .insert(users)
  //    .values({ username: "test3", provider: "local", password: "test" }),
  //]);
});

afterAll(async () => {
  await pool.end();
});

test.only("tesintg users table", async () => {
  const data = await db.select().from(users);

  expect(data).toBeArray();
  expect(data[0].id).toEqual(1);
  expect(data[0].role).toEqual("user");
  expect(data[0].username).toEqual("test1");
  expect(data[0].password).toEqual("test");
  expect(data[2].username).toEqual("test3");
  expect(data.length).toEqual(3);
});
