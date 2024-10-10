/* eslint-disable */
// @ts-nocheck
import { eq } from "drizzle-orm";
import db from "../../../database";
import { notifications } from "../../../database/schemas";
import { server } from "../../../server";
import { expect, it } from "bun:test";

it("adding profile fully", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($backgroundPic: String, $bio: String, $profilePic: String){
  crudProfile (backgroundPic: $backgroundPic, bio: $bio, profilePic: $profilePic){
    bio
    backgroundPic
    profilePic
    userId
  }
}`,
      variables: {
        backgroundPic: "test pic",
        bio: "hello, world",
        profilePic: "test pic",
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
  expect(query.crudProfile.userId).toEqual(1);
  expect(query.crudProfile.backgroundPic).toEqual("test pic");
  expect(query.crudProfile.bio).toEqual("hello, world");
  expect(query.crudProfile.profilePic).toEqual("test pic");
});

it("adding profile partly", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation( $profilePic: String){
  crudProfile ( profilePic: $profilePic){
    profilePic
    backgroundPic
    userId
    bio
  }
}`,
      variables: {
        bio: "hello, world 2",
        profilePic: "test pic 2",
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
  expect(query.crudProfile.userId).toEqual(1);
  expect(query.crudProfile.backgroundPic).toEqual("test pic");
  expect(query.crudProfile.bio).toEqual("hello, world");
  expect(query.crudProfile.profilePic).toEqual("test pic 2");
});
