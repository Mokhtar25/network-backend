import { GraphQLSchema } from "graphql";

import { query } from "./queries/query";
import { mutation } from "./mutation/mutation";
import { subs } from "./sockets";

export const schema = new GraphQLSchema({
  query: query,
  mutation: mutation,
  subscription: subs,
});

//export const schemaA = mergeSchemas({
//  schemas: [schemaS],
//  typeDefs: /* GraphQL */ `
//    type Subscription {
//      personAdded: Person!
//    }
//    type Person {
//      name: String
//    }
//  `,
//  resolvers: {
//    Person: {
//      name: () => "adam",
//    },
//    Subscription: {
//      personAdded: {
//        subscribe: () => pubsub.asyncIterator("PERSON_ADDED"),
//      },
//    },
//  },
//});
