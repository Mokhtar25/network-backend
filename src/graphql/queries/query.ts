import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
} from "graphql";
import { entities } from "../server";
import { pubsub } from "../server";
import { MyContext } from "../../server";
import db from "../../database";
import { extractFilters } from "drizzle-graphql";

import { notiQuery } from "./notiQuery";
import { users } from "../../database/schemas";
import { findUser } from "./findUser";
import { postsQuery } from "./posts";
// extract resolvers

export const query = new GraphQLObjectType({
  name: "query",
  fields: {
    postSingle: entities.queries.postsSingle,
    posts: postsQuery,
    commentSingle: entities.queries.commentSingle,
    likeSingle: entities.queries.likeSingle,
    likes: entities.queries.like,
    comments: entities.queries.comment,
    postsPictureSingle: entities.queries.postsPictureSingle,
    postsPictures: entities.queries.postsPicture,
    profiles: entities.queries.profile,
    profile: entities.queries.profileSingle,
    followers: entities.queries.followers,
    notifications: notiQuery,
    findUser: findUser,
  },
});
