import db from "../../database";
import { z } from "zod";
import { MyContext } from "../../server";
import { badContentError } from "./errors";

import { requestObject } from "./posts";
import { notifications, NotificationsEnum } from "../../database/schemas/noti";
// this shouldnt be in graphql. its called just to update read or not. make another one for something else
export const crudNoti = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  const request = requestObject.safeParse(args);
  if (!request.success) return badContentError();

  // check when to update and when to add stuff/or make its on the Frontend to send which fields
  // if you don't provide the field it wont be changed. so that is good and is left to the Frontend

  const argsData = z
    .object({
      type: z.enum(NotificationsEnum),
      itemID: z.string(),
      read: z.boolean().optional(),
      textContent: z.string().optional(),
    })
    .passthrough();

  const safeData = argsData.safeParse(args);
  console.log(safeData.error);
  if (!safeData.success) return badContentError();

  const data = await db
    .insert(notifications)
    .values({
      type: safeData.data.type,
      read: safeData.data.read ?? false,
      itemID: safeData.data.itemID,
      textContent: safeData.data.textContent,
      senderId: context.user.id,
    })
    .returning();

  // do the notifications
  // pubsub.subscribe("")
  console.log(data);
  return data[0];
};
