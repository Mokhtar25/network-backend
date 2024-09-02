import { relations } from "drizzle-orm";
import { posts } from "./schemas/post";
import { comment } from "./schemas/comment";
import { users } from "./schemas/usersSchema";
import { like } from "./schemas/like";
import { postsPicture } from "./schemas/postPictures";
import { pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `test_network:${name}`);

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
