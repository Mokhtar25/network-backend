import { AnyColumn } from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import db from "../../database";
import { posts } from "../../database/schema";

export const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};

export const decrement = (column: AnyColumn, value = 1) => {
  return sql`${column} - ${value}`;
};

type Opreation = "increment" | "decrement";
export function updatePostCommentCount(postId: string, type: Opreation) {
  db.update(posts)
    .set({
      commentCount:
        type === "increment"
          ? increment(posts.commentCount)
          : decrement(posts.commentCount),
    })
    .where(eq(posts.id, postId))
    .then(() => null)
    .catch((err) => console.log("error updating posts comment count", err));
}

export function updatePostLikeCount(postId: string, type: Opreation) {
  db.update(posts)
    .set({
      likesCount:
        type === "increment"
          ? increment(posts.likesCount)
          : decrement(posts.likesCount),
    })
    .where(eq(posts.id, postId))
    .then(() => null)
    .catch((err) => console.log("error updating posts comment count", err));
}
