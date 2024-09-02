import { createTable } from "../schema";
import { uuid, serial, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./usersSchema";
import { posts } from "./post";
import { createInsertSchema } from "drizzle-zod";

export const like = createTable(
  "like",
  {
    userId: serial("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("postId")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      id: primaryKey({ name: "likeId", columns: [table.postId, table.userId] }),
    };
  },
);

export type Like = typeof like.$inferSelect;

export const insertLikeSchema = createInsertSchema(like).omit({
  createdAt: true,
});
