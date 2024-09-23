import { pubsub } from "../server";
import { GraphQLString, GraphQLObjectType } from "graphql";
import { entities } from "../server";
import { withFilter } from "graphql-subscriptions";

export const subs = new GraphQLObjectType({
  name: "sub",
  fields: {
    testing: {
      type: GraphQLString,
      subscribe: () => pubsub.asyncIterator("testing"),
    },
    message: {
      type: entities.types.MessageItem,
      subscribe: withFilter(
        () => pubsub.asyncIterator("message"),
        (payload, variables) => {
          console.log(variables, payload, "here it was ---------------");

          return true;
        },
      ),
    },
  },
});
