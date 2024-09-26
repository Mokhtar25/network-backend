import { pubsub } from "../server";
import { GraphQLObjectType } from "graphql";
import { entities } from "../server";
import { withFilter } from "graphql-subscriptions";
import type { MessageType } from "../../database/schemas/message";
import { NotificationsSelection } from "../../database/schemas/noti";

interface SocketContext {
  user: number | null;
}
interface MessagePayload {
  message: MessageType;
}

interface notificationsPayload {
  notifications: NotificationsSelection;
}

export const subs = new GraphQLObjectType({
  name: "sub",
  fields: {
    notifications: {
      type: entities.types.NotificationsItem,
      subscribe: withFilter(
        () => pubsub.asyncIterator("notifications"),
        (payload: notificationsPayload, _variables, context: SocketContext) => {
          console.log(payload);
          if (payload.notifications.receiverId === context.user) return true;
          return false;
        },
      ),
    },
    message: {
      type: entities.types.MessageItem,
      subscribe: withFilter(
        () => pubsub.asyncIterator("message"),
        (payload: MessagePayload, _variables, context: SocketContext) => {
          if (payload.message.receiverId === context.user) return true;
          return false;
        },
      ),
    },
  },
});
