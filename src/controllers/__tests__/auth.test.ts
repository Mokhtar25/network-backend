import supertest from "supertest";
import { it, describe, expect } from "bun:test";

import { app } from "../../server";

const api = supertest(app);

describe("testing works", () => {
  it("tests and api works", async () => {
    await api
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/html; charset=utf-8");

    return;
  });
  return;
});

describe("testing manual login", () => {
  it("testing stuff", () => {
    return;
    console.log("");
  });
  return;
});
//  await api.post("/api/user").send(user).expect(201);
//});
//
//test("notes are returned as json", async () => {
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
