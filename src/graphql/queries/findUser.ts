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
import { extractFilters, Filters, Table } from "drizzle-graphql";
import { users } from "../../database/schemas";
import type { MyContext } from "../../server";
import { eq } from "drizzle-orm";

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
    const returnType = {
      username: users.username,
      displayName: users.displayName,
      id: users.id,
    };
    if (args.id || args.username) {
      const user = await db
        .select(returnType)
        .from(users)
        .where(
          eq(args.id ? users.id : users.username, args.id ?? args.username),
        );
      return user;
    }

    if (!args.where) throw new GraphQLError("missing filters");
    const user = await db
      .select(returnType)
      .from(users)
      // method needs to be updated by package devs, currently manually exposed
      // eslint-disable-next-line
      .where(extractFilters(users, "users", args.where));
    return user;
  },
};
