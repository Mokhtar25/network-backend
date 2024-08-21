import {
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { MyContext } from "../server";
import { buildSchema, extractFilters } from "drizzle-graphql";
import db from "../database";
import { posts, postsPicture, users } from "../database/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { QueryBuilder } from "drizzle-orm/pg-core";
import { addComment, addLike, addPost } from "./resolvers/posts";

export const { entities } = buildSchema(db);

console.log(typeof extractFilters);
//console.log(entities.inputs.UsersFilters, "foi ----------------------------");
// build half of this using already method as readONly and mutation and users manually
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    fields: {
      postSingle: entities.queries.postsSingle,
      posts: entities.queries.posts,
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
      addComment: {
        type: new GraphQLNonNull(entities.types.CommentItem),
        args: {
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
        resolve: addComment,
      },

      addLike: {
        type: new GraphQLNonNull(entities.types.LikeItem),
        args: {
          postId: {
            type: new GraphQLNonNull(GraphQLID),
          },
        },
        resolve: addLike,
      },
      addPost: {
        type: new GraphQLNonNull(entities.types.PostsItem),
        args: {
          textContent: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: addPost,
      },
    },
  }),
});
