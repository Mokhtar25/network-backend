import { createTable } from "../schema";
import { uuid, varchar } from "drizzle-orm/pg-core";
import { posts } from "./post";

export const postsPicture = createTable("postsPicture", {
  postId: uuid("postId")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  url: varchar("url", { length: 256 }).notNull(),
});
