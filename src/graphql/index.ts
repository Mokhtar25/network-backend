import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { entities, pubsub } from "./server";

import { mergeSchemas } from "@graphql-tools/schema";
import { query } from "./queries/query";
import { mutation } from "./mutation/mutation";

export const schema = new GraphQLSchema({
  query: query,
  mutation: mutation,
  subscription: new GraphQLObjectType({
    name: "sub",
    fields: {
      testing: {
        type: GraphQLString,
        subscribe: () => pubsub.asyncIterator("testing"),
      },
      message: {
        type: entities.types.MessageItem,
        subscribe: () => pubsub.asyncIterator("message"),
      },
    },
  }),
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
