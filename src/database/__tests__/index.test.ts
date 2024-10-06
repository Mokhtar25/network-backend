import { test, expect } from "bun:test";

import db from "../index";
import { users } from "../schemas";

test.skip("Database connection works {users table}", async () => {
  const data = await db.select().from(users);
  expect(data).toBeArray();
});
