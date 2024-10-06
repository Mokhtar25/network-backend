import { expect, test, it } from "bun:test";
import { server } from "./server";
import { makeHash } from "./lib/auth/authUtils";
//import { posts } from "./database/schemas";

test.skip("things run", async () => {
  //const data = await db.select().from(posts);

  const da = await makeHash("password");
  expect(da).toBeString();
});

it.skip("graphql and findUser", async () => {
  const data = await server.executeOperation({
    query: `query( $id: Int) {
  findUser (id : $id) {
    username
  }
}`,
    variables: { id: 1 },
  });

  console.log(data.body.singleResult.data.findUser);
  expect(data.body.kind).toBe("single");
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.findUser[0].username).toBeString();
});

it.skip("context in graphql and notifications", async () => {
  const data = await server.executeOperation(
    {
      query: `query{
  notifications {
    itemID
    id
    read
  }
}`,
    },
    {
      contextValue: {
        isAuthenticated: () => true,
        user: { id: 1 },
      },
    },
  );
  expect(data.body.kind).toBe("single");
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.notifications).toBeArray();
  expect(data.body.singleResult.data.notifications[0].id).toBeString();
  expect(data.body.singleResult.data.notifications[0].read).toBeBoolean();
});
