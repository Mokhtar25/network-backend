/* eslint-disable */
// @ts-nocheck
import { server } from "../../../server";
import { expect, it } from "bun:test";

it("post query return a list of posts", async () => {
  const data = await server.executeOperation({
    query: `
    query{
  posts {
    posts {
      textContent
      id
    }
    comment {
      content
      id
    }
    postsPicture {
      postId
      url
    }
  }
}
    `,
  });

  expect(data.body.singleResult).toBeDefined();
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.posts).toBeArray();
  expect(data.body.singleResult.data.posts[0].posts.id).toBeString();
  expect(data.body.singleResult.data.posts[0].postsPicture).toBeArray();
  expect(data.body.singleResult.data.posts[0].postsPicture[0].url).toBeString();
  expect(data.body.singleResult.data.posts[0].comment[0].content).toEqual(
    "test comment",
  );
});
