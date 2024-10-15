/* eslint-disable */
// @ts-nocheck
import supertest from "supertest";
import { it, describe, expect } from "bun:test";

import { app } from "../../server";

const api = supertest(app);

describe("you can get a signed url", () => {
  it("you can get a singed url", async () => {
    const datas = await api
      .post("/auth/login")
      .send({ username: "test1", password: "test" });

    const cookie = datas.headers["set-cookie"][0];

    const data = await api
      .post("/files/getsignurl")
      .set("Cookie", cookie)
      .send({ fileName: "hello" })
      .expect(200);

    expect(data.body.fileName.endsWith("hello")).toBeTrue();
    expect(data.body.timestamp).toBeNumber();
    expect(data.body.signature).toBeString();
  });

  it("you can get a singed url", async () => {
    const datas = await api
      .post("/auth/login")
      .send({ username: "test1", password: "test" });

    const cookie = datas.headers["set-cookie"][0];

    await api
      .post("/files/getsignurl")
      .set("Cookie", cookie)
      .send({ fileName: "" })
      .expect(400);
  });

  it("you cant get singedurl if not authed ", async () => {
    await api.post("/files/getsignurl").send({ fileName: "hello" }).expect(401);
  });
});
