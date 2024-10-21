import { test, expect } from "bun:test";
import db from "../index";
import { users } from "../schemas";
import { checkPassword } from "../../lib/auth/authUtils";

test("users table is rested and seed with users for testing", async () => {
  const data = await db.select().from(users);

  expect(data).toBeArray();
  expect(data[0].id).toEqual(1);
  expect(data[0].role).toEqual("user");
  expect(data[0].username).toEqual("test0");
  expect(await checkPassword("test", data[0].password!)).toBeTrue();
  expect(data[2].username).toEqual("test2");
  expect(data.length >= 4).toBeTrue();
});
