import {
  GraphQLError,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { MyContext } from "../server";
import { buildSchema } from "drizzle-graphql";
import dbs from "../database";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { QueryBuilder } from "drizzle-orm/pg-core";

export const { schema, entities } = buildSchema(dbs);

//console.log(entities.inputs.UsersFilters, "foi ----------------------------");
// build half of this using already method as readONly and mutation and users manually
export const Aschema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    fields: {
      user: entities.queries.usersSingle,

      findUser: {
        type: new GraphQLList(new GraphQLNonNull(entities.types.UsersItem)),
        args: {
          where: {
            type: entities.inputs.UsersFilters,
          },
          id: {
            type: GraphQLString,
          },
        },

        resolve: async (root, args, context: MyContext, info) => {
          console.log(args, context.user, "0000000000000:-----");
          console.log(args.where.username.eq);
          const user = await dbs.select().from(user);

          return user;
        },
      },
    },
  }),
});

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