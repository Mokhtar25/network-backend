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
import { extractFilters } from "drizzle-graphql";
import { users } from "../../database/schemas";
import type { MyContext } from "../../server";
import { pubsub } from "../server";

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
      type: GraphQLString,
    },
  },
  // args has filter type. may be imported from package internals later
  resolve: async (_: unknown, args: unknown, context: MyContext) => {
    pubsub
      .publish("testing", { testing: "hiiiiiii" })
      .then(() => null)
      .catch((er) => console.log(er));
    console.log(context);
    if (!args.where) throw new GraphQLError("missing filters");
    const user = await db
      .select({
        username: users.username,
        displayName: users.displayName,
        id: users.id,
      })
      .from(users)
      // method needs to be updated by package devs, currently manually exposed
      // eslint-disable-next-line
      .where(extractFilters(users, "users", args.where));

    return user;
  },
};
