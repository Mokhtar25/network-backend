import { GraphQLObjectType } from "graphql";
import { entities } from "../server";
import { notiQuery } from "./notiQuery";
import { findUser } from "./findUser";
import { postsQuery } from "./posts";

export const query = new GraphQLObjectType({
  name: "query",
  fields: {
    postSingle: entities.queries.postsSingle,
    commentSingle: entities.queries.commentSingle,
    likeSingle: entities.queries.likeSingle,
    likes: entities.queries.like,
    comments: entities.queries.comment,
    postsPictureSingle: entities.queries.postsPictureSingle,
    postsPictures: entities.queries.postsPicture,
    profiles: entities.queries.profile,
    profile: entities.queries.profileSingle,
    followers: entities.queries.followers,

    // none-plugin
    posts: postsQuery,
    notifications: notiQuery,
    findUser: findUser,
  },
});
