import { GraphQLSchema } from "graphql";

import { query } from "./queries/query";
import { mutation } from "./mutation/mutation";
import { subs } from "./sockets";

export const schema = new GraphQLSchema({
  query: query,
  mutation: mutation,
  subscription: subs,
});
