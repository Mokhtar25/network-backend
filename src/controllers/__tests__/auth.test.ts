import supertest from "supertest";
import { it, describe, expect } from "bun:test";

import { app } from "../../server";
import db from "../../database";
import { users } from "../../database/schemas";
import { eq } from "drizzle-orm";
import env from "../../../env";

const api = supertest(app);

describe("testing works", () => {
  it("tests and api works", async () => {
    await api.get("/").expect(200);
  });
});

describe("login and sign up", () => {
  it("signing up works", async () => {
    await db.delete(users).where(eq(users.username, "testingSignup"));
    const data = await api
      .post("/auth/signup")
      .send({ username: "testingSignup", password: "testingSignup" })
      .expect(302);

    const use = await db
      .select()
      .from(users)
      .where(eq(users.username, "testingSignup"));

    expect(use[0].username).toEqual("testingSignup");

    console.log(data);
  });

  it("signing with the same username results in an error", async (done) => {
    const data = await api
      .post("/auth/signup")
      .send({ username: "testingSignup", password: "testingSignup" })
      .expect(400);

    const use = await db
      .select()
      .from(users)
      .where(eq(users.username, "testingSignup"));

    expect(use.length).toEqual(1);
    expect(data.text).toEqual("Username is taken");
    done();
  });

  it("signing with invalid data gives error", async (done) => {
    const data = await api
      .post("/auth/signup")
      .send({ username: "2", password: "" })
      .expect(400);

    expect(data.text).toEqual("Invalid data");
    done();
  });

  let cookie: string;
  it("getting a cookie and redircted after singing up", async () => {
    await db.delete(users).where(eq(users.username, "testingSignup"));
    // test cookies and redirect
    const data = await api
      .post("/auth/signup")
      .send({ username: "testingSignup", password: "testingSignup" })
      .expect(302)
      .expect("location", env.SUCCESS_REDIRECT_URL);
    console.log(data.body);
    expect(data.headers["set-cookie"][0]).toMatch(/^connect.sid=s%/);
    cookie = data.headers["set-cookie"][0];
  });

  it("singing with cookie", async () => {
    const data = await api.get("/auth/me").set("Cookie", cookie).expect(200);
    expect(data.body).toBeNumber();
  });

  it("singing with information", async () => {
    await api
      .post("/auth/login")
      .send({ username: "test1", password: "test" })
      .expect(302);
  });
});
