import { GraphQLError } from "graphql";
export const typeDefs = `#graphql
  type Query {
    hello: String
    me : User
  }
  type User {
      id : ID!
      username : String!
  }
`;
// A map of functions which return data for the schema.
export const resolvers = {
    Query: {
        hello: () => "world",
        me: (_, __, context) => {
            if (!context.isAuthenticated)
                throw new GraphQLError("no auth function");
            console.log(context.isAuthenticated(), __, "--------");
            return context.user;
        },
    },
};
