import { GraphQLError } from "graphql";
import db from "../../database";
import { z } from "zod";
import { posts } from "../../database/schema";
import { MyContext } from "../../server";

export const makePost = async (
  _: string,
  args: unknown,
  context: MyContext,
) => {
  if (!context.user) throw new GraphQLError("unAuthorized");

  const makePostArgs = z.object({
    textContent: z.string().min(1),
  });
  const safeArgs = makePostArgs.safeParse(args);

  console.log(safeArgs);
  if (!safeArgs.success) throw new GraphQLError("Missing content");

  const post = await db
    .insert(posts)
    .values({
      textContent: safeArgs.data.textContent,
      userId: context.user.id,
    })
    .returning();

  return post[0];
};
