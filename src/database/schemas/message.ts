import { createTable } from "../schema";
import {
  uuid,
  pgEnum,
  text,
  boolean,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { chats } from "./chats";

export const messageType = pgEnum("messageType", ["image", "text"]);
export const MessageType = messageType.enumValues;

export const message = createTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: integer("senderId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  textContent: text("textContent"),
  imageUrl: varchar("imageUrl", { length: 256 }),
  chatId: uuid("chatId")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  reciverId: integer("receiverId")
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
