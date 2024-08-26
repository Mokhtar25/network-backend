import db from "../database";
import { and, eq, sql } from "drizzle-orm";

import { posts } from "../database/schema";
import { postsPicture } from "../database/schema";
// add pictures while also allow only the same user
const sq = db.$with("sq").as(
  db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.id, "cd3fdfa9-6a64-4c21-9946-3af1113bacaf"),
        eq(posts.userId, 1),
      ),
    ),
);

const data = await db
  .with(sq)
  .insert(postsPicture)
  .values({
    postId: sql`(select "id" from "sq")`,
    url: "test 1",
  });

console.log(data);
