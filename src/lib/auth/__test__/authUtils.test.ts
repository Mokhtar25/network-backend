import { test, expect } from "bun:test";
import { checkPassword, makeHash } from "../authUtils";

test("Check password function utilis", async () => {
  const password = "test";

  const hash = await makeHash(password);

  expect(hash).toBeString();
  expect(hash.length).toBeGreaterThanOrEqual(10);

  const check = await checkPassword(password, hash);

  expect(check).toBeTrue();
});
