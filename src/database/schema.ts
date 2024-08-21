import {
  pgEnum,
  varchar,
  pgTable,
  serial,
  text,
  timestamp,
  pgTableCreator,
  uuid,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

export const createTable = pgTableCreator((name) => `test_network:${name}`);

export const users = createTable("users_test", {
  id: serial("id").primaryKey().notNull().unique(),
  providerId: varchar("providerId", { length: 256 }),
  displayName: text("displayName"),
  password: text("password"),
  username: varchar("username", { length: 256 }).unique(),
  email: text("email"),
  description: text("description"),
  provider: text("provider", { enum: ["github", "google", "local"] }).default(
    "local",
  ),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type User = typeof users.$inferSelect; // return type when queried

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserSchemaOauth = createInsertSchema(users, {
  providerId: z.string().or(z.number()),
  role: z.string(),
});
//// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);

//// Refining the fields - useful if you want to change the fields before they become nullable/optional in the final schem

//const insertUserSchema = createInsertSchema(users, {
//  id: (schema) => schema.id.positive(),
//  email: (schema) => schema.email.email(),
//  role: z.string(),
//});

//console.log(user);
/// schema type is also inferred from the table schema, so you have full type safety

//const requestSchema = insertUserSchema.pick({
//  displayName: true,
//  email: true,
//});

export const posts = createTable("posts", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  userId: serial("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  textContent: text("textContent"),
  likesCount: integer("likesCount").default(0),
  commentCount: integer("commentCount").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Post = typeof posts.$inferSelect;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  updatedAt: true,
});

//const a = insertPostSchema.safeParse({ das });

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
      id: primaryKey({ columns: [table.postId, table.userId] }),
    };
  },
);

export type Like = typeof like.$inferSelect;

export const insertLikeSchema = createInsertSchema(like).omit({
  createdAt: true,
});

export const postsPicture = createTable("postsPicture", {
  postId: uuid("postId")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  url: varchar("url", { length: 256 }).notNull(),
});
// build drizzle relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  likes: many(like),
  comment: many(comment),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  pictures: many(postsPicture),
  comments: many(comment),
  likes: many(like),
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const picturePostsRelations = relations(postsPicture, ({ one }) => ({
  post: one(posts, {
    fields: [postsPicture.postId],
    references: [posts.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(users, {
    fields: [comment.userId],
    references: [users.id],
  }),
  posts: one(posts, {
    fields: [comment.postId],
    references: [posts.id],
  }),
}));
export const likeRelations = relations(like, ({ one }) => ({
  user: one(users, {
    fields: [like.userId],
    references: [users.id],
  }),
  posts: one(posts, {
    fields: [like.postId],
    references: [posts.id],
  }),
}));
