import { GraphQLSchema } from "graphql";
import { pubsub } from "./server";

import { mergeSchemas } from "@graphql-tools/schema";
import { query } from "./queries/query";
import { mutation } from "./mutation/mutation";

export const schemaS = new GraphQLSchema({
  query: query,
  mutation: mutation,
});
export const schema = mergeSchemas({
  schemas: [schemaS],
  typeDefs: /* GraphQL */ `
    type Subscription {
      personAdded: Person!
    }
    type Person {
      name: String
    }
  `,
  resolvers: {
    Person: {
      name: () => "adam",
    },
    Subscription: {
      personAdded: {
        subscribe: () => pubsub.asyncIterator("PERSON_ADDED"),
      },
    },
  },
});
