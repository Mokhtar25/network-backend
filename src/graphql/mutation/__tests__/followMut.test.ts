/* eslint-disable */
// @ts-nocheck
import { eq } from "drizzle-orm";
import db from "../../../database";
import { notifications } from "../../../database/schemas";
import { server } from "../../../server";
import { expect, it } from "bun:test";

it("you can add a follower", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $followerId: Int!){
  crudFollower(type: $type, followerId: $followerId) {
    followeId
    userId
  }
}`,
      variables: {
        type: "post",
        followerId: 3,
      },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  console.log(data.body.singleResult);
  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  const query = data.body.singleResult.data;
  expect(query.crudFollower.userId).toEqual(1);
  expect(query.crudFollower.followeId).toEqual(3);
});

it("you cannt add a follower twice", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $followerId: Int!){
  crudFollower(type: $type, followerId: $followerId) {
    followeId
    userId
  }
}`,
      variables: {
        type: "post",
        followerId: 2,
      },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );
  expect(data.body.singleResult.errors).toBeDefined();
});

it("you can remove a follower", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $followerId: Int!){
  crudFollower(type: $type, followerId: $followerId) {
    followeId
    userId
  }
}`,
      variables: {
        type: "delete",
        followerId: 2,
      },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  console.log(data.body.singleResult);
  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  const query = data.body.singleResult.data;
  expect(query.crudFollower.userId).toEqual(1);
  expect(query.crudFollower.followeId).toEqual(2);
});
