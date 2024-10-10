import { eq, sql } from "drizzle-orm";
import db from "../database";
import { notifications, posts } from "../database/schemas";
import { NotificationsSelection } from "../database/schemas/noti";
import { pubsub } from "./server";

const sendNoti = (payload: NotificationsSelection) => {
  pubsub
    .publish("notifications", { notifications: payload })
    .then(() => null)
    .catch((e) => console.log(e));
};

export const addLikeNotifications = async (userid: number, postId: string) => {
  // you can maybe combine both queries into a one query

  const userLikeId = db
    .$with("userLikeId")
    .as(
      db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId)),
    );

  const returnNot = await db
    .with(userLikeId)
    .insert(notifications)
    .values({
      type: "like",
      itemID: postId,
      receiverId: sql`(select "userId" from "userLikeId")`,
      senderId: userid,
    })
    .returning();

  sendNoti(returnNot[0]);
};

export const addCommentNotifications = async (
  userid: number,
  postId: string,
) => {
  // you can maybe combine both queries into a one query

  const userLikeId = db
    .$with("userLikeId")
    .as(
      db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId)),
    );

  const returnNot = await db
    .with(userLikeId)
    .insert(notifications)
    .values({
      type: "commnet",
      itemID: postId,
      receiverId: sql`(select "userId" from "userLikeId")`,
      senderId: userid,
    })
    .returning();

  // do the call here
  console.log("done", userid, postId, returnNot[0]);

  sendNoti(returnNot[0]);
};

export const addFollowerNotifications = async (
  userId: number,
  followerId: number,
) => {
  // you can maybe combine both queries into a one query

  const returnNot = await db
    .insert(notifications)
    .values({
      type: "follow",
      receiverId: followerId,
      senderId: userId,
    })
    .returning();

  console.log(returnNot[0]);

  sendNoti(returnNot[0]);
  // do the call here
};

export const receiveMessageNori = async (
  userId: number,
  receiverId: number,
  message: string | null,
) => {
  // if !textContent then you can handel it as "sent you a message"
  const noti = await db
    .insert(notifications)
    .values({
      type: "message",
      senderId: userId,
      textContent: message,
      receiverId: receiverId,
    })
    .returning();

  return noti[0];
};
