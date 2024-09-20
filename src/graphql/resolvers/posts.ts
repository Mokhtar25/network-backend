import { GraphQLError } from "graphql";
import db from "../../database";
import { z } from "zod";
import { posts, comment, like } from "../../database/schemas";
import { MyContext } from "../../server";
import { and, eq } from "drizzle-orm";
import {
  updatePostCommentCount,
  updatePostLikeCount,
} from "../utils/sqlHelpers";
import { notAuthError, badContentError } from "./errors";
import {
  addCommentNotifications,
  addLikeNotifications,
} from "../notificationsFunctions";

export const RequestTypeEnum = ["update", "post", "delete"] as const;
// could have added a var or an enum with every request to check what opreation that is wanted to be done
// like add, update. or delete. and make the opreation mandtoary to add
// this would solve the issue completely.
// no need for socket.io, you can use subscriptions in graphql
export const requestObject = z
  .object({
    type: z.enum(RequestTypeEnum),
  })
  .passthrough();

const noMehtodError = (args: unknown) => {
  const safeParse = requestObject.safeParse(args);
  console.log(safeParse.error);
  if (!safeParse.success) throw new GraphQLError("no Method Provided");
  return safeParse;
};
export const crudPost = async (
  _: string,
  args: unknown,
  context: MyContext,
) => {
  notAuthError(context.user);
  const argsMethode = noMehtodError(args);

  if (argsMethode.data.type === "post") {
    const makePostArgs = z.object({
      textContent: z.string().min(1),
    });
    const safeArgs = makePostArgs.safeParse(args);

    if (!safeArgs.success) return badContentError();

    const post = await db
      .insert(posts)
      .values({
        textContent: safeArgs.data.textContent,
        userId: context.user.id,
      })
      .returning();

    return post[0];
  } else if (argsMethode.data.type === "update") {
    const makePostArgs = z.object({
      textContent: z.string().min(1),
      postId: z.string().min(1),
    });
    const safeArgs = makePostArgs.safeParse(args);

    if (!safeArgs.success) return badContentError();

    const post = await db
      .update(posts)
      .set({
        textContent: safeArgs.data.textContent,
      })
      .where(
        and(
          eq(posts.id, safeArgs.data.postId),
          eq(posts.userId, context.user.id),
        ),
      )
      .returning();

    if (!post[0]) throw new GraphQLError("Post not found, or Not Authorized");

    return post[0];
  } else {
    const makePostArgs = z.object({
      postId: z.string().min(1),
    });
    const safeArgs = makePostArgs.safeParse(args);

    if (!safeArgs.success) return badContentError();

    const post = await db
      .delete(posts)
      .where(
        and(
          eq(posts.id, safeArgs.data.postId),
          eq(posts.userId, context.user.id),
        ),
      )
      .returning();

    if (!post[0]) throw new GraphQLError("Not found or unAuthorized");

    return post[0];
  }
};
export const crudComment = async (
  _: string,
  args: unknown,
  context: MyContext,
) => {
  notAuthError(context.user);
  const method = noMehtodError(args);

  const makePostArgs = z.object({
    commentId: z.string().optional().nullish(),
    content: z.string().min(1),
    postId: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);

  if (!safeArgs.success) return badContentError();

  if (method.data.type === "post") {
    const commentReturn = await db
      .insert(comment)
      .values({
        content: safeArgs.data.content,
        userId: context.user.id,
        postId: safeArgs.data.postId,
      })
      .returning();

    updatePostCommentCount(commentReturn[0].postId, "increment");
    // eslint-disable-next-line
    addCommentNotifications(commentReturn[0].userId, commentReturn[0].postId);

    return commentReturn[0];
  } else if (method.data.type === "update") {
    if (!safeArgs.data.commentId) return badContentError();
    const commentReturn = await db
      .update(comment)
      .set({
        content: safeArgs.data.content,
      })
      .where(
        and(
          eq(comment.id, safeArgs.data.commentId),
          eq(comment.userId, context.user.id),
        ),
      )
      .returning();

    if (!commentReturn[0]) throw new GraphQLError("not found or unAuthorized");

    return commentReturn[0];
  } else {
    if (!safeArgs.data.commentId) return badContentError();
    const commentReturn = await db
      .delete(comment)
      .where(
        and(
          eq(comment.id, safeArgs.data.commentId),
          eq(comment.userId, context.user.id),
        ),
      )
      .returning();

    if (!commentReturn[0]) throw new GraphQLError("not found or unAuthorized");

    // update db with count

    updatePostCommentCount(commentReturn[0].postId, "decrement");
    return commentReturn[0];
  }
};

// this takes more logic
// logic to add or delete likes. more like toggling
export const crudLike = async (
  _: string,
  args: unknown,
  context: MyContext,
) => {
  notAuthError(context.user);
  const method = noMehtodError(args);

  if (method.data.type === "update")
    throw new GraphQLError("Updates are not allowed in likes");
  const makePostArgs = z.object({
    postId: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);
  if (!safeArgs.success) return badContentError();
  if (method.data.type === "post") {
    const likeReturned = await db
      .insert(like)
      .values({
        userId: context.user.id,
        postId: safeArgs.data.postId,
      })
      .returning();

    updatePostLikeCount(likeReturned[0].postId, "increment");
    // eslint-disable-next-line
    addLikeNotifications(likeReturned[0].userId, likeReturned[0].postId);
    return likeReturned[0];
  } else {
    const likeReturned = await db
      .delete(like)
      .where(
        and(
          eq(like.userId, context.user.id),
          eq(like.postId, safeArgs.data.postId),
        ),
      )
      .returning();

    if (!likeReturned[0]) return new GraphQLError("Like was not found");

    updatePostLikeCount(likeReturned[0].postId, "decrement");
    return likeReturned[0];
  }
};
