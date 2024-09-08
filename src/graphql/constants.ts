// notifications

import { eq } from "drizzle-orm";
import db from "../database";
import { notifications, posts } from "../database/schemas";
// this should go away
import { crudNoti } from "./resolvers/noti";

export const addLikeNotifications = async (userid: number, postId: string) => {
  // you can maybe combine both queries into a one query
  const userLikeId = await db.select().from(posts).where(eq(posts.id, postId));

  const returnNot = await db
    .insert(notifications)
    .values({
      type: "like",
      itemID: postId,
      reciverId: userLikeId[0].userId,
      senderId: userid,
    })
    .returning();

  // do the call here

  console.log("done", userid, postId, returnNot[0]);
};

export const addCommentNotifications = async (
  userid: number,
  postId: string,
) => {
  // you can maybe combine both queries into a one query
  const userLikeId = await db.select().from(posts).where(eq(posts.id, postId));

  const returnNot = await db
    .insert(notifications)
    .values({
      type: "commnet",
      itemID: postId,
      reciverId: userLikeId[0].userId,
      senderId: userid,
    })
    .returning();

  // do the call here
  console.log("done", userid, postId, returnNot[0]);
};
