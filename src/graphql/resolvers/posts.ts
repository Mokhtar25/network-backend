import { GraphQLError } from "graphql";
import db from "../../database";
import { z } from "zod";
import { comment, like, posts } from "../../database/schema";
import { MyContext } from "../../server";
import { and, eq } from "drizzle-orm";

const RequestTypeEnum = ["update, post, delete"] as const;
// could have added a var or an enum with every request to check what opreation that is wanted to be done
// like add, update. or delete. and make the opreation mandtoary to add
// this would solve the issue completely.
// no need for socket.io, you can use subscriptions in graphql
export const addPost = async (_: string, args: unknown, context: MyContext) => {
  notAuthError(context.user);

  const makePostArgs = z.object({
    textContent: z.string().min(1),
    type: z.enum(RequestTypeEnum),
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

  console.log("ryn");
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
  console.log(commentReturn[0]);

  return commentReturn[0];
};

// this takes more logic
// logic to add or delete likes. more like toggling
export const addLike = async (_: string, args: unknown, context: MyContext) => {
  notAuthError(context.user);

  const makePostArgs = z.object({
    postId: z.string().min(1),
    unLike: z.boolean().optional(),
  });
  const safeArgs = makePostArgs.safeParse(args);

  if (!safeArgs.success) return badContentError();

  if (safeArgs.data.unLike) {
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
    return likeReturned[0];
  }
  const likeReturned = await db
    .insert(like)
    .values({
      userId: context.user.id,
      postId: safeArgs.data.postId,
    })
    .returning();

  return likeReturned[0];
};
