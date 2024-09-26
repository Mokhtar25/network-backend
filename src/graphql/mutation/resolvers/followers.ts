import db from "../../../database";
import { z } from "zod";
import { MyContext } from "../../../server";
import { badContentError } from "./errors";
import { followers } from "../../../database/schemas";
import { requestObject } from "./posts";
import { and, eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { addFollowerNotifications } from "../../notificationsFunctions";

export const Crudfollowers = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  const request = requestObject.safeParse(args);
  if (!request.success) return badContentError();

  const argsObject = z.object({
    followerId: z.number(),
  });

  const safeArgs = argsObject.safeParse(args);
  if (!safeArgs.success) return badContentError();

  if (request.data.type === "post") {
    const follow = await db
      .insert(followers)
      .values({
        userId: context.user.id,
        followeId: safeArgs.data.followerId,
      })
      .returning();

    // eslint-disable-next-line
    addFollowerNotifications(follow[0].userId, follow[0].followeId);
    return follow[0];
  } else {
    const follow = await db
      .delete(followers)
      .where(
        and(
          eq(followers.userId, context.user.id),
          eq(followers.followeId, safeArgs.data.followerId),
        ),
      )
      .returning();
    if (!follow[0]) throw new GraphQLError("not found");

    return follow[0];
  }
};
