import { pubsub } from "../server";
import { GraphQLString, GraphQLObjectType } from "graphql";
import { entities } from "../server";
import { withFilter } from "graphql-subscriptions";
import type { MessageType } from "../../database/schemas/message";
interface SocketContext {
  user: number | null;
}
interface MessagePayload {
  message: MessageType;
}

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
        (payload: MessagePayload, _variables, context: SocketContext) => {
          if (!context.user) return false;

          if (payload.message.receiverId === context.user) return true;

          return false;
        },
      ),
    },
  },
});
