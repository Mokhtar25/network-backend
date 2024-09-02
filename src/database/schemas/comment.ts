import { createTable } from "../schema";
import { uuid, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./post";
import { createInsertSchema } from "drizzle-zod";

export const comment = createTable("comment", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  userId: serial("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("postId")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const insertCommentSchema = createInsertSchema(comment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Comment = typeof comment.$inferSelect;
