import { findOrMake } from "../../config/passport";
import { verfiy } from "../../config/passport";
import { it, expect, describe, mock } from "bun:test";
import db from "../../database";
import { users } from "../../database/schemas";
import { makeHash } from "../../lib/auth/authUtils";
import { eq } from "drizzle-orm";

describe("oauth testing utils", () => {
  let id: number;
  it("testing making func", async () => {
    const data = await findOrMake({
      id: "123123",
      provider: "github",
      displayName: "testing",
      username: "hellom",
      // @ts-expect-error asd
      emails: ["one@one.com", "two@two.com"],
    });

    id = data.id;
    expect(data.provider).toEqual("github");
    expect(data.username).toEqual("hellom");
    expect(data.displayName).toEqual("testing");
    expect(data.email).toEqual("one@one.com");
  });
  it("testing finding func", async () => {
    const data = await findOrMake({
      id: "123123",
      provider: "github",
      displayName: "testing",
      username: "hellom",
      // @ts-expect-error asd
      emails: ["one@one.com", "two@two.com"],
    });

    expect(data.provider).toEqual("github");
    expect(data.username).toEqual("hellom");
    expect(data.displayName).toEqual("testing");
    expect(data.email).toEqual("one@one.com");
    expect(data.id).toEqual(id);
  });
  return;
});

describe.only("passport testing utils", () => {
  it("testing making func ", async () => {
    await db.delete(users).where(eq(users.username, "test"));
    const hash = await makeHash("test");
    await db.insert(users).values({ username: "test", password: hash });
    const func = mock(() => null);
    verfiy("test", "test", func);
    await new Promise((res, _rej) => {
      setTimeout(() => res("ji"), 800);
    });

    expect(func).toBeCalled();
    //@ts-expect-error asd
    expect(func.mock.calls[0][0]).toBeNull();
    //@ts-expect-error asd
    expect(func.mock.calls[0][1].username).toEqual("test");
  });
  return;
});
