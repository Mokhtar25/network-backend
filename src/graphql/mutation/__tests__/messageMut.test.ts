/* eslint-disable */
// @ts-nocheck
import { server } from "../../../server";
import { expect, it } from "bun:test";

it("post query return a list of posts", async () => {
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
  //expect(data.body.singleResult.data.crudPost.postsPicture).toBeArray();
});
