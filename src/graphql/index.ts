import { GraphQLError } from "graphql";
import { MyContext } from "../server";

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
    me: (_: string, __: Request, context: MyContext) => {
      if (!context.isAuthenticated) throw new GraphQLError("no auth function");
      //console.log(context.isAuthenticated(), __, "--------");

      return context.user;
    },
  },
};
