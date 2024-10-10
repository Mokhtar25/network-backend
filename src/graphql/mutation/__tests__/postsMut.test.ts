/* eslint-disable */
// @ts-nocheck
import { eq } from "drizzle-orm";
import db from "../../../database";
import { posts } from "../../../database/schemas";
import { server } from "../../../server";
import { expect, it } from "bun:test";

let postId;
it("you can create post with mutation endpoint", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $textContent: String!){
  crudPost(type: $type, textContent: $textContent) {
    id
    likesCount
    textContent
    userId
  }
}    `,
      variables: { type: "post", textContent: "test post" },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  console.log(data.body.singleResult);
  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.crudPost.id).toBeString();
  expect(data.body.singleResult.data.crudPost.likesCount).toEqual(0);
  expect(data.body.singleResult.data.crudPost.textContent).toEqual("test post");
  postId = data.body.singleResult.data.crudPost.id;
  //expect(data.body.singleResult.data.crudPost.postsPicture).toBeArray();
});

it("you can update post with mutation endpoint", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $textContent: String!, $postId : String){
  crudPost(type: $type, textContent: $textContent, postId : $postId) {
    id
    likesCount
    textContent
    userId
  }
}    `,
      variables: { type: "update", textContent: "test post update", postId },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  console.log(data.body.singleResult);
  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.crudPost.id).toBeString();
  expect(data.body.singleResult.data.crudPost.likesCount).toEqual(0);
  expect(data.body.singleResult.data.crudPost.textContent).toEqual(
    "test post update",
  );

  expect(
    await db
      .select()
      .from(posts)
      .where(eq(posts.textContent, "test post update")),
  ).toBeArrayOfSize(1);
});
it("you can remove post with mutation endpoint", async () => {
  const data = await server.executeOperation(
    {
      query: `
        mutation($type: requestMethod!,  $postId : String){
          crudPost(type: $type, postId : $postId) {
            id
            likesCount
            textContent
            userId
          }
        }  
`,
      variables: { type: "delete", postId },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.crudPost.id).toBeString();
  expect(data.body.singleResult.data.crudPost.likesCount).toEqual(0);
  expect(data.body.singleResult.data.crudPost.textContent).toEqual(
    "test post update",
  );

  expect(
    await db
      .select()
      .from(posts)
      .where(eq(posts.textContent, "test post update")),
  ).toBeEmpty();
});
