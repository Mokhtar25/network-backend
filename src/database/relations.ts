import { relations } from "drizzle-orm";
import { postsPicture, like, posts, comment, users } from "./schemas";
// this for query syntax in drizzle

// build drizzle relations
//export const usersRelations = relations(users, ({ many }) => ({
//  posts: many(posts),
//  likes: many(like),
//  comment: many(comment),
//}));

export const postsRelations = relations(posts, ({ many }) => ({
  postsPicture: many(postsPicture),
  comments: many(comment),
  likes: many(like),
  //author: one(users, {
  //  fields: [posts.userId],
  //  references: [users.id],
  //}),
}));

export const picturePostsRelations = relations(postsPicture, ({ one }) => ({
  post: one(posts, {
    fields: [postsPicture.postId],
    references: [posts.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  //user: one(users, {
  //  fields: [comment.userId],
  //  references: [users.id],
  //}),
  posts: one(posts, {
    fields: [comment.postId],
    references: [posts.id],
  }),
}));
export const likeRelations = relations(like, ({ one }) => ({
  //user: one(users, {
  //  fields: [like.userId],
  //  references: [users.id],
  //}),
  posts: one(posts, {
    fields: [like.postId],
    references: [posts.id],
  }),
}));
