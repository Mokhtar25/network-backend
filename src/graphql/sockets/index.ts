import { pubsub } from "../server";
import { GraphQLString, GraphQLObjectType } from "graphql";
import { entities } from "../server";
import { withFilter } from "graphql-subscriptions";

export const subs = new GraphQLObjectType({
  name: "sub",
  fields: {
    testing: {
      type: GraphQLString,
      subscribe: withFilter(
        (zx, eq, er) => {
          console.log(zx, eq, er, "etie-");

          return pubsub.asyncIterator("testing");
        },
        (c, x, r, s) => {
          console.log(c, x, r, "--------------------tesint");
          return true;
        },
      ),
    },
    message: {
      type: entities.types.MessageItem,

      subscribe: withFilter(
        () => pubsub.asyncIterator("message"),
        (payload, variables, xtx) => {
          console.log(variables, payload, xtx, "here it was ---------------");

          return true;
        },
      ),
    },
  },
});
