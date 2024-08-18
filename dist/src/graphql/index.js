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
        me: (root, args, context) => {
            console.log(context, args, root, "--------");
            return context.user;
        },
    },
};
