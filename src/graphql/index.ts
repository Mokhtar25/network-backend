console.log("run before ");
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphqlSync,
} from "graphql";
import { MyContext } from "../server";
import { buildSchema, extractFilters } from "drizzle-graphql";
import db from "../database";
import { posts, postsPicture, users } from "../database/schemas";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { QueryBuilder } from "drizzle-orm/pg-core";
import { crudComment, crudLike, crudPost } from "./resolvers/posts";

import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
import { mergeSchemas } from "@graphql-tools/schema";
console.log("run index after import");
export const { entities } = buildSchema(db);

export const RequestTypeEnumGraphQl = new GraphQLEnumType({
  name: "requestMethod",
  values: {
    update: { value: "update" },
    post: { value: "post" },
    delete: { value: "delete" },
  },
});

console.log(typeof extractFilters);
//console.log(entities.inputs.UsersFilters, "foi ----------------------------");
// build half of this using already method as readONly and mutation and users manually
export const schemaS = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    fields: {
      postSingle: entities.queries.postsSingle,
      commentSingle: entities.queries.commentSingle,
      likeSingle: entities.queries.likeSingle,
      likes: entities.queries.like,
      comments: entities.queries.comment,
      postsPictureSingle: entities.queries.postsPictureSingle,
      postsPictures: entities.queries.postsPicture,
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
          pubsub.publish("PERSON_ADDED", { personAdded: { name: "him" } });
          console.log(args.where.username.eq);
          const user = await db
            .select()
            .from(users)
            // method needs to be updated by package devs, currently manually exposed
            // eslint-disable-next-line
            .where(extractFilters(users, "users", args.where));

          console.log(user);
          return user;
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",

    fields: {
      crudComment: {
        type: new GraphQLNonNull(entities.types.CommentItem),
        args: {
          type: {
            type: new GraphQLNonNull(RequestTypeEnumGraphQl),
          },
          content: {
            type: new GraphQLNonNull(GraphQLString),
          },
          postId: {
            type: new GraphQLNonNull(GraphQLID),
          },
          commentId: {
            type: GraphQLID,
          },
        },
        resolve: crudComment,
      },

      crudLike: {
        type: new GraphQLNonNull(entities.types.LikeItem),
        args: {
          type: {
            type: new GraphQLNonNull(RequestTypeEnumGraphQl),
          },
          postId: {
            type: new GraphQLNonNull(GraphQLID),
          },
        },
        resolve: crudLike,
      },
      crudPost: {
        type: new GraphQLNonNull(entities.types.PostsItem),
        args: {
          type: {
            type: new GraphQLNonNull(RequestTypeEnumGraphQl),
          },
          textContent: {
            type: new GraphQLNonNull(GraphQLString),
          },
          postId: {
            type: GraphQLString,
          },
        },
        resolve: crudPost,
      },
    },
  }),
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
