import { createTable } from "../schema";

import {
  pgEnum,
  uuid,
  boolean,
  serial,
  text,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const notificationsEnum = pgEnum("type", [
  "commet",
  "follow",
  "like",
  "message",
]);
export const NotificationsEnum = notificationsEnum.enumValues;

export const notifications = createTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: serial("senderId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  receiverId: serial("receiverId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // not putting a relation to make it more versatile
  itemID: uuid("itemId"),
  textContent: text("textContent"),
  read: boolean("read").default(false),
  type: notificationsEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
},(table)=>{
    return {
      receiverIndex: index("notifications_receiver_idx").on(table.receiverId),
      readIndex: index("notifications_read_idx").on(table.read),
      createdAtIndex: index("notifications_created_at_idx").on(table.createdAt),
    };
} );


export type NotificationsInsert = typeof notifications.$inferInsert;
export type NotificationsSelection = typeof notifications.$inferSelect;
