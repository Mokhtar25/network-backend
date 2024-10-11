import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { entities } from "../server";
import db from "../../database";
import { users } from "../../database/schemas";
import type { MyContext } from "../../types/context";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const findUser = {
  type: new GraphQLList(
    new GraphQLNonNull(
      new GraphQLObjectType({
        name: "user_select",
        fields: {
          username: { type: new GraphQLNonNull(GraphQLString) },
          id: { type: new GraphQLNonNull(GraphQLInt) },
          displayName: { type: GraphQLString },
        },
      }),
    ),
  ),
  args: {
    where: {
      type: entities.inputs.UsersFilters,
    },
    id: {
      type: GraphQLInt,
    },
    username: {
      type: GraphQLString,
    },
  },

  // args has filter type. may be imported from package internals later
  resolve: async (_: unknown, args: unknown, _context: MyContext) => {
    const userReturnTypes = {
      username: users.username,
      displayName: users.displayName,
      id: users.id,
    };

    // refine args to accept only usernames OR ids
    const argsObject = z
      .object({
        id: z.number().optional(),
        username: z.string().min(1).optional(),
      })
      .refine((data) => {
        if (!data.username && !data.id) {
          return false;
        }
        if (data.username && data.id) {
          return false;
        }
        return true;
      });

    const safeArgs = argsObject.safeParse(args);

    if (!safeArgs.success) {
      throw new GraphQLError("Please provide a username or an id");
    }
    const user = await db
      .select(userReturnTypes)
      .from(users)
      .where(
        // @ts-expect-error this will exist because its check and refined by zod and not dented by lsp
        eq(
          safeArgs.data.id ? users.id : users.username,
          safeArgs.data.id ?? safeArgs.data.username,
        ),
      );
    return user;
  },
};
