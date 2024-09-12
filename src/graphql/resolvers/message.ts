import db from "../../database";
import { z } from "zod";
import { MyContext } from "../../server";
import { badContentError } from "./errors";
import { requestObject } from "./posts";
import { message, MessageType } from "../../database/schemas/message";
import { receiveMessageNori } from "../constants";

const messageTypeEnum = z.enum(MessageType);
export const crudMessage = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  const request = requestObject.safeParse(args);
  if (!request.success) return badContentError();

  // check when to update and when to add stuff/or make its on the frontend to send which fields
  // // if you dont provide the field it wont be changed. so that is good and is left to the frontend
  const argsData = z
    .object({
      textContent: z.string().optional(),
      messageType: messageTypeEnum,
      imageUrl: z.string().optional(),
      chatId: z.string().uuid(),
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

  const data = await db
    .insert(message)
    .values({
      chatId: safeData.data.chatId,
      imageUrl: safeData.data.imageUrl,
      messageType: safeData.data.messageType,
      senderId: context.user.id,
      reciverId: safeData.data.receiverId,
      textContent: safeData.data.textContent,
    })
    .returning();

  receiveMessageNori(data[0].senderId, data[0].reciverId, data[0].textContent)
    .then(() => null)
    .catch(() => {});

  return data[0];
};
