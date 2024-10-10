/* eslint-disable */
// @ts-nocheck
import { server } from "../../../server";
import { expect, it } from "bun:test";

let id;
it("sending a message works", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $receiverId: Int!, $messageType: MessageType!, $textContent: String){
  crudMessage(type: $type, receiverId: $receiverId, messageType: $messageType, textContent: $textContent) {
    id
    imageUrl
     messageType
     read
     receiverId
     senderId
     textContent
  }
}`,
      variables: {
        type: "post",
        textContent: "test message",
        receiverId: 2,
        messageType: "text",
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
  expect(query.crudMessage.id).toBeString();
  expect(query.crudMessage.read).toBeFalse();
  expect(query.crudMessage.senderId).toEqual(1);
  expect(query.crudMessage.receiverId).toEqual(2);
  expect(query.crudMessage.textContent).toEqual("test message");
  id = query.crudMessage.id;
});

it("sending a message with a picture works", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $receiverId: Int!, $messageType: MessageType!, $imageUrl: String){
  crudMessage(type: $type, receiverId: $receiverId, messageType: $messageType, imageUrl: $imageUrl) {
    textContent
    id
    imageUrl 
    messageType
  }
}`,
      variables: {
        type: "post",
        imageUrl: "hello",
        receiverId: 2,
        messageType: "image",
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
  expect(query.crudMessage.id).toBeString();
  expect(query.crudMessage.textContent).toBeFalsy();
  expect(query.crudMessage.imageUrl).toEqual("hello");
});

it("deleting messages work", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $receiverId: Int!, $messageType: MessageType!, $textContent: String,$messageId: ID){
  crudMessage(type: $type, receiverId: $receiverId, messageType: $messageType, textContent: $textContent,  messageId: $messageId) {
    id
    imageUrl
     messageType
     read
     receiverId
     senderId
     textContent
  }
}`,
      variables: {
        type: "delete",
        textContent: "test message",
        receiverId: 2,
        messageType: "text",
        messageId: id,
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
  expect(query.crudMessage.id).toBeString();
  expect(query.crudMessage.read).toBeFalse();
  expect(query.crudMessage.senderId).toEqual(1);
  expect(query.crudMessage.receiverId).toEqual(2);
  expect(query.crudMessage.textContent).toEqual("test message");
});

it("deleting the same message fails", async () => {
  const data = await server.executeOperation(
    {
      query: `
mutation($type: requestMethod!, $receiverId: Int!, $messageType: MessageType!, $textContent: String,$messageId: ID){
  crudMessage(type: $type, receiverId: $receiverId, messageType: $messageType, textContent: $textContent,  messageId: $messageId) {
    id
    imageUrl
     messageType
     read
     receiverId
     senderId
     textContent
  }
}`,
      variables: {
        type: "delete",
        textContent: "test message",
        receiverId: 2,
        messageType: "text",
        messageId: id,
      },
    },
    {
      contextValue: { isAuthenticated: () => true, user: { id: 1 } },
    },
  );

  console.log(data.body.singleResult);
  expect(data.body.singleResult.errors).toBeDefined();
  expect(data.body.singleResult.data).toBeNull();
});
