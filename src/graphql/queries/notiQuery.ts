import { GraphQLList } from "graphql";
import { notifications } from "../../database/schemas";
import { entities } from "../server";
import { MyContext } from "../../types/context";
import db from "../../database";
import { eq } from "drizzle-orm";

export const notiQuery = {
  type: new GraphQLList(entities.types.NotificationsSelectItem),
  resolve: async (_root: unknown, _args: unknown, context: MyContext) => {
    const noti = await db
      .select()
      .from(notifications)
      .where(eq(notifications.receiverId, context.user.id))
      .limit(10)
      .orderBy(notifications.createdAt);

    return noti;
  },
};
