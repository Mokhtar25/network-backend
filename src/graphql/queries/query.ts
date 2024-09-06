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
import { users } from "../../database/schemas";
// extract resolvers

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
    notifications: entities.queries.notifications,

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

      resolve: async (_, args, context: MyContext) => {
        await pubsub.publish("PERSON_ADDED", { personAdded: { name: "him" } });
        console.log(context);
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
});
