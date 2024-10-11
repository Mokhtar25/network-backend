import db from "../../../database";
import { z } from "zod";
import type { MyContext } from "../../../types/context";
import { badContentError } from "./errors";
import { requestObject } from "./posts";
import { message, MessageTypeEnum } from "../../../database/schemas/message";
import { receiveMessageNori } from "../../notificationsFunctions";
import { and, eq, or, sql } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { pubsub } from "../../server";
import { chats } from "../../../database/schemas";

const messageTypeEnum = z.enum(MessageTypeEnum);
export const crudMessage = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  const request = requestObject.safeParse(args);
  if (!request.success) return badContentError();

  // check when to update and when to add stuff/or make its on the frontend to send which fields
  // // if you dont provide the field it wont be changed. so that is good and is left to the frontend

  if (request.data.type === "update")
    throw new GraphQLError("Method not supported");

  if (request.data.type === "delete") {
    const deleteArgs = z.object({
      messageId: z.string(),
    });
    const safeArgs = deleteArgs.safeParse(args);
    if (!safeArgs.success) return badContentError();

    const messageRetun = await db
      .delete(message)
      .where(
        and(
          eq(message.id, safeArgs.data.messageId),
          eq(message.senderId, context.user.id),
        ),
      )
      .returning();

    if (!messageRetun[0]) return badContentError("Message not found");

    return messageRetun[0];
  }
  const argsData = z
    .object({
      textContent: z.string().optional(),
      messageType: messageTypeEnum,
      imageUrl: z.string().optional(),
      receiverId: z.number(),
    })
    .passthrough()
    .refine((input) => {
      // check if the correct type of message with the correct params
      if (input.messageType === "text" && !input.textContent) return false;
      if (input.messageType === "image" && !input.imageUrl) return false;

      return true;
    });

  const safeData = argsData.safeParse(args);

  console.log(safeData.error);
  if (!safeData.success) return badContentError();

  // it doesn't matter who is the id
  const chatsq = db.$with("chatsq").as(
    db
      .select({ id: chats.id })
      .from(chats)
      .where(
        or(
          and(
            eq(chats.receiverId, safeData.data.receiverId),
            eq(chats.userId, context.user.id),
          ),
          and(
            eq(chats.userId, safeData.data.receiverId),
            eq(chats.receiverId, context.user.id),
          ),
        ),
      ),
  );

  //// find the chat id, Or make a new chat
  let data;
  try {
    data = await db
      .with(chatsq)
      .insert(message)
      .values({
        chatId: sql`(select id from chatsq limit 1)`,
        imageUrl: safeData.data.imageUrl,
        messageType: safeData.data.messageType,
        senderId: context.user.id,
        receiverId: safeData.data.receiverId,
        textContent: safeData.data.textContent,
      })
      .returning();
  } catch (err) {
    console.log(err);
    // find a method to combine the two queries into trip to the db: currently drizzle supports only select
    // with with clause
    const chatId = await db
      .insert(chats)
      .values({
        receiverId: safeData.data.receiverId,
        userId: context.user.id,
      })
      .returning({ id: chats.id });

    data = await db
      .insert(message)
      .values({
        chatId: chatId[0].id,
        imageUrl: safeData.data.imageUrl,
        messageType: safeData.data.messageType,
        senderId: context.user.id,
        receiverId: safeData.data.receiverId,
        textContent: safeData.data.textContent,
      })
      .returning();
  }

  receiveMessageNori(data[0].senderId, data[0].receiverId, data[0].textContent)
    .then(() => null)
    .catch(() => {});

  pubsub
    .publish("message", { message: data[0] })
    .then(() => null)
    .catch((e) => console.log(e));

  return data[0];
};
