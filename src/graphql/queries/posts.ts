import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { comment, posts, postsPicture } from "../../database/schemas";
import { entities } from "../server";
import type { MyContext } from "../../server";
import db from "../../database";
import { eq } from "drizzle-orm";

// this has n + 1 problem and need to be fixed
const type = new GraphQLObjectType({
  name: "posts_testing",
  fields: {
    posts: { type: entities.types.PostsItem },
    postsPicture: { type: entities.types.PostsPictureItem },

    comments: {
      type: new GraphQLList(entities.types.CommentSelectItem),
      resolve: async (root, args, context) => {
        const commentsReturn = await db
          .select()
          .from(comment)
          .where(eq(comment.postId, root.posts.id));
        return commentsReturn;
      },
    },
  },
});
function doesPathExist(nodes, path) {
  if (!nodes) {
    return false;
  }
  console.log(nodes[0].name.value, path[0], "-------------0000");
  const node = nodes.find((x) => x.name.value === path[0]);

  if (!node) {
    return false;
  }

  if (path.length === 1) {
    return true;
  }

  return doesPathExist(node.selectionSet.selections, path.slice(1));
}
export const postsQuery = {
  type: new GraphQLList(type),
  resolve: async (
    _root: unknown,
    _args: unknown,
    _context: MyContext,
    info,
  ) => {
    console.log(
      doesPathExist(info.fieldNodes, ["posts", "postsPicture", "comments"]),
      "this is no------------",
    );

    const postsDb = await db
      .select()
      .from(posts)
      .orderBy(posts.createdAt)
      .leftJoin(postsPicture, eq(posts.id, postsPicture.postId))
      .limit(1);

    return postsDb;
  },
};
