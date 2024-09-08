import { createTable } from "../schema";
import {
  uuid,
  serial,
  pgEnum,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { chats } from "./chats";

export const messageType = pgEnum("messageType", ["image", "text"]);

export const message = createTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: integer("senderId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  textContent: text("textContent"),
  chatId: uuid("chatId")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  reciverId: integer("reciverId")
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
