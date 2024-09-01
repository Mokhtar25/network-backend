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
  unique,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";
import { arrayBuffer } from "stream/consumers";
import { type } from "os";

export const createTable = pgTableCreator((name) => `test_network:${name}`);

// set up indexes for what you wanna query by, like for postsPicture make it post id
export const users = createTable(
  "users_test",
  {
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
  },
  (table) => {
    return {
      uniquieUsernameWithAuth: unique("provider and username").on(
        table.username,
        table.provider,
      ),
    };
  },
);

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

const notificationsEnum = pgEnum("type", [
  "commnet",
  "like",
  "request",
  "acceptRequest",
]);
export const notifications = createTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: serial("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // not putting a relation to make it more versatile
  itemID: uuid("itemId").notNull(),
  textContent: text("textContent"),
  read: boolean("read").default(false),
  type: notificationsEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const chats = createTable("chats", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  userId: serial("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  reciverId: serial("reciverId").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
const messageType = pgEnum("messageType", ["image", "text"]);
export const message = createTable("message", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  senderId: serial("senderId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  textContent: text("textContent"),
  chatId: uuid("chatId")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  reciverId: serial("reciverId")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  read: boolean("read").default(false),
  messageType: messageType("messageType").default("text"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

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
      id: primaryKey({ name: "likeId", columns: [table.postId, table.userId] }),
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

export const profile = createTable("profile", {
  userId: serial("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  profilePic: varchar("ProfilePic", { length: 256 }),
  backgroundPic: varchar("backgroundPic", { length: 256 }),
  bio: text("text"),
});

export const followers = createTable(
  "following",
  {
    userId: serial("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followeId: serial("id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      id: primaryKey({
        name: "id",
        columns: [table.userId, table.followeId],
      }),
    };
  },
);

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
