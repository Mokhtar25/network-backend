import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLString,
} from "graphql";
import { comment, posts, postsPicture } from "../../database/schemas";
import { entities } from "../server";
import type { MyContext } from "../../server";
import db from "../../database";
import { eq } from "drizzle-orm";
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
export const postsQuery = {
  type: new GraphQLList(type),
  resolve: async (
    _root: unknown,
    _args: unknown,
    _context: MyContext,
    info: GraphQLResolveInfo,
  ) => {
    const infopa = parseResolveInfo(info);

    // @ts-expect-error its unknown for now
    console.log(infopa?.fieldsByTypeName.posts_testing.comments);

    //const postsDb = await db
    //  .select()
    //  .from(posts)
    //  .rightJoin(comment, eq(comment.postId, posts.id))
    //  .leftJoin(postsPicture, eq(posts.id, postsPicture.postId))
    //  .limit(5);
    //console.log(postsDb);

    const postsDb = await db.query.posts.findMany({
      limit: 2,
      orderBy: posts.createdAt,
      with: {
        comments: true,
        postsPicture: {
          columns: {
            postId: true,
            url: true,
          },
        },
      },
    });
    console.log(postsDb);

    const news = postsDb.map((ele) => {
      console.log(typeof postsDb[0].postsPicture);

      return {
        comment: ele.comments,
        // this solvers the wired drizzle orm problem and its fixed
        postsPicture: ele.postsPicture.map((e) => {
          return e;
        }),
        posts: { ...ele, comments: undefined, postsPicture: undefined },
      };
    });

    console.log(news, "000");

    return news;
  },
};
