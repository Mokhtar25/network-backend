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

it("testing stuff", () => {
  expect(1 === 1).toBeTrue();
});

describe.only("login and sign up", () => {
  it.only("signing up works", async () => {
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

  it.only("getting a cookie and redircted after singing up", async () => {
    await db.delete(users).where(eq(users.username, "testingSignup"));
    // test cookies and redirect
    const data = await api
      .post("/auth/signup")
      .send({ username: "testingSignup", password: "testingSignup" })
      .expect(302)
      .expect("location", env.SUCCESS_REDIRECT_URL);
  });
});

//
//it("notes are returned as json", async () => {
//  await api
//    .get("/api/user")
//    .expect(200)
//    .expect("Content-Type", /application\/json/);
//});
//
//test("two users in database", async () => {
//  const users = await api
//    .get("/api/user")
//    .expect(200)
//    .expect("Content-Type", /application\/json/);
//  assert.strictEqual(users.body.length, initUsers.length);
//});
//
//test("creating a valid user", async () => {
//  const user = {
//    name: "hani",
//    username: "hani12",
//    password: "123456",
//  };
//
//  const res = await api.post("/api/user").send(user).expect(201);
//
//  const users = await usersInDb();
//
//  assert.strictEqual(users.length, initUsers.length + 1);
//  assert.strictEqual(res.body.name.includes("hani"), true);
//});
//
//test("creating a invalid users", async () => {
//  const user = {
//    name: "hani",
//    password: "123456",
//  };
//
