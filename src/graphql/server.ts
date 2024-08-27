import db from "../database";
import { and, between, eq, sql } from "drizzle-orm";

import { comment, posts } from "../database/schema";
import { postsPicture } from "../database/schema";
// add pictures while also allow only the same user
//const sq = db.$with("sq").as(
//  db
//    .select({ id: posts.id })
//    .from(posts)
//    .where(
//      and(
//        eq(posts.id, "cd3fdfa9-6a64-4c21-9946-3af1113bacaf"),
//        eq(posts.userId, 1),
//      ),
//    ),
//);
//
//const data = await db
//  .with(sq)
//  .insert(postsPicture)
//  .values({
//    postId: sql`(select "id" from "sq")`,
//    url: "test 1",
//  });

// works
const yest = await db

  .select()
  .from(posts)
  .where(
    between(
      posts.id,
      "5c69176f-355c-4a5d-8438-59366e99e4a9",
      "891bcfd0-8af3-4a09-bf5c-5830315b9a54",
    ),
  );
console.log(yest);
const sa = await db
  .select({
    postContent: posts.textContent,
    likesNum: posts.likesCount,
    commentNum: posts.commentCount,
    comments: comment.content,
    url: postsPicture.url,
  })
  .from(posts)
  .leftJoin(comment, eq(comment.postId, posts.id))
  .leftJoin(postsPicture, eq(postsPicture.postId, posts.id));

console.log(sa);
// this returns an array. easier to use
const qw = await db.query.posts.findMany({
  columns: {
    textContent: true,
  },
  with: {
    comments: {
      columns: {
        content: true,
      },
      orderBy: comment.createdAt,
      limit: 3,
    },
    likes: true,
  },
});
console.log(qw);
console.log(qw[0].comments);
