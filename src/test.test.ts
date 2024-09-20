//import db from "./database";

import { expect, test } from "bun:test";
import { makeHash } from "./lib/auth/authUtils";
//import { posts } from "./database/schemas";

test("things run", async () => {
  //const data = await db.select().from(posts);

  const da = await makeHash("password");
  expect(da).toBeString();
});
