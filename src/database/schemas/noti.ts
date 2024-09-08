import { createTable } from "../schema";

import {
  pgEnum,
  uuid,
  boolean,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const notificationsEnum = pgEnum("type", [
  "commnet",
  "like",
  "request",
  "acceptRequest",
]);
export const NotificationsEnum = notificationsEnum.enumValues;

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

export type NotificationsInsert = typeof notifications.$inferInsert;
export type NotificationsSelection = typeof notifications.$inferSelect;
