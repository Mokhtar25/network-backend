import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLList,
} from "graphql";
import { entities } from "../server";
import { RequestTypeEnumGraphQl } from "../server";
import * as mute from "./resolvers/posts";
import { CrudProfile } from "./resolvers/profile";
import { Crudfollowers } from "./resolvers/followers";
import { crudMessage } from "./resolvers/message";

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

    crudFollower: {
      type: new GraphQLNonNull(entities.types.FollowersItem),
      args: {
        type: {
          type: new GraphQLNonNull(RequestTypeEnumGraphQl),
        },
        followerId: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: Crudfollowers,
    },
    crudMessage: {
      type: new GraphQLNonNull(entities.types.MessageItem),
      args: {
        type: {
          type: new GraphQLNonNull(RequestTypeEnumGraphQl),
        },
        receiverId: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        textContent: {
          type: GraphQLString,
        },
        messageId: {
          type: GraphQLID,
        },
        imageUrl: {
          type: GraphQLString,
        },
        messageType: {
          // make this into an enum from database
          type: new GraphQLNonNull(
            new GraphQLEnumType({
              name: "MessageType",
              values: {
                text: { value: "text" },
                image: { value: "image" },
              },
            }),
          ),
        },
      },
      resolve: crudMessage,
    },

    crudProfile: {
      type: new GraphQLNonNull(entities.types.ProfileItem),
      args: {
        bio: {
          type: GraphQLString,
        },
        backgroundPic: {
          type: GraphQLString,
        },
        profilePic: {
          type: GraphQLString,
        },
      },
      resolve: CrudProfile,
    },
    crudPost: {
      type: new GraphQLNonNull(
        new GraphQLObjectType({
          name: "PostWithPictures",
          fields: {
            post: { type: new GraphQLNonNull(entities.types.PostsItem) },
            postPictures: {
              type: new GraphQLNonNull(
                new GraphQLList(entities.types.PostsPictureItem),
              ),
            },
          },
        }),
      ),
      args: {
        type: {
          type: new GraphQLNonNull(RequestTypeEnumGraphQl),
        },
        textContent: {
          type: GraphQLString,
        },
        postPictures: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
        },
        postId: {
          type: GraphQLString,
        },
      },
      resolve: mute.crudPost,
    },
  },
});
