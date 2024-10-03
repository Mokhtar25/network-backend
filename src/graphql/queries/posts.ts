import { GraphQLList, GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { posts } from "../../database/schemas";
import { entities } from "../server";
import type { MyContext } from "../../server";
import db from "../../database";
import { parseResolveInfo } from "graphql-parse-resolve-info";

const queryName = "posts_testing";
// this has n + 1 problem and need to be fixed
const type = new GraphQLObjectType({
  name: queryName,
  fields: {
    posts: { type: entities.types.PostsItem },
    postsPicture: { type: new GraphQLList(entities.types.PostsPictureItem) },

    comment: {
      type: new GraphQLList(entities.types.CommentSelectItem),
    },
  },
});
// TODO
export const postsQuery = {
  type: new GraphQLList(type),
  resolve: async (
    _root: unknown,
    _args: unknown,
    _context: MyContext,
    info: GraphQLResolveInfo,
  ) => {
    // parse info to know what fields are requested
    const infopa = parseResolveInfo(info);

    console.log(infopa?.fieldsByTypeName.posts_testing);

    const postsDb = await db.query.posts.findMany({
      limit: 2,
      orderBy: posts.createdAt,
      with: {
        comments: true,
        postsPicture: true,
      },
    });
    const news = postsDb.map((ele) => {
      return {
        comment: ele.comments,
        // this solvers the wired drizzle ORM problem and its fixed
        postsPicture: ele.postsPicture,
        posts: { ...ele, comments: undefined, postsPicture: undefined },
      };
    });
    return news;
  },
};
