import { server } from "../../server";
import { test, expect } from "bun:test";

test("graphql wokring and returning data from database", async () => {
  const data = await server.executeOperation({
    query: `query( $id: Int) {
  findUser (id : $id) {
    username
  }
}`,
    variables: { id: 1 },
  });

  expect(data.body.kind).toBe("single");
  expect(data.body.singleResult.errors).toBeUndefined();
  expect(data.body.singleResult.data.findUser[0].username).toBeString();
});

//test("context in graphql and notifications", async () => {
//  const data = await server.executeOperation(
//    {
//      query: `query{
//  notifications {
//    itemID
//    id
//    read
//  }
//}`,
//    },
//    {
//      contextValue: {
//        isAuthenticated: () => true,
//        user: { id: 1 },
//      },
//    },
//  );
//  expect(data.body.kind).toBe("single");
//  expect(data.body.singleResult.errors).toBeUndefined();
//  expect(data.body.singleResult.data.notifications).toBeArray();
//  expect(data.body.singleResult.data.notifications[0].id).toBeString();
//  expect(data.body.singleResult.data.notifications[0].read).toBeBoolean();
//});
