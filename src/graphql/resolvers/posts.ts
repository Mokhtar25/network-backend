import { GraphQLError } from "graphql";
import db from "../../database";
import { z } from "zod";
import { comment, like, posts, users } from "../../database/schema";
import { MyContext } from "../../server";
import { and, eq } from "drizzle-orm";

export const addPost = async (_: string, args: unknown, context: MyContext) => {
  notAuthError(context.user);

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
};

const badContentError = () => {
  throw new GraphQLError("Missing content", {
    extensions: {
      code: "Bad Request",
      http: { status: 400 },
    },
  });
};

const notAuthError = (user: unknown) => {
  if (!user)
    throw new GraphQLError("unAuthorized", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
};
export const addComment = async (
  _: string,
  args: unknown,
  context: MyContext,
) => {
  notAuthError(context.user);

  const makePostArgs = z.object({
    commentId: z.string().optional().nullish(),
    content: z.string().min(1),
    postId: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);

  if (!safeArgs.success) return badContentError();

  console.log(safeArgs.data.commentId, "here is the id");
  if (safeArgs.data.commentId) {
    console.log("ran inside");
    const commentReturn = await db
      .update(comment)
      .set({
        content: safeArgs.data.content,
      })
      .where(eq(comment.id, safeArgs.data.commentId))
      .returning();
    console.log("old and new", safeArgs.data.commentId, commentReturn[0].id);

    return commentReturn[0];
  }
  console.log("ran outside");

  const commentReturn = await db
    .insert(comment)
    .values({
      content: safeArgs.data.content,
      userId: context.user.id,
      postId: safeArgs.data.postId,
    })
    .returning();

  return commentReturn[0];
};

// this takes more logic
export const addLike = async (_: string, args: unknown, context: MyContext) => {
  notAuthError(context.user);

  const makePostArgs = z.object({
    postId: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);

  if (!safeArgs.success) return badContentError();

  const likeReturned = await db
    .insert(like)
    .values({
      userId: context.user.id,
      postId: safeArgs.data.postId,
    })
    .returning()
    .onConflictDoUpdate({ set: { userId: null, postId: null } });

  return likeReturned[0];
};
