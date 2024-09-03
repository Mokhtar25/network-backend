import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
} from "graphql";
import { entities } from "../server";
import { RequestTypeEnumGraphQl } from "..";
import * as mute from "../resolvers/posts";

export const mutation = new GraphQLObjectType({
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
      resolve: mute.crudComment,
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
      resolve: mute.crudLike,
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
      resolve: mute.crudPost,
    },
  },
});
