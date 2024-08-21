import { GraphQLError } from "graphql";
import db from "../../database";
import { z } from "zod";
import { comment, like, posts } from "../../database/schema";
import { MyContext } from "../../server";

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
    content: z.string().min(1),
    postId: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);

  if (!safeArgs.success) return badContentError();

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
