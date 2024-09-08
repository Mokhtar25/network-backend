import { createTable } from "../schema";
import { uuid, unique, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const chats = createTable(
  "chats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: integer("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    receiverId: integer("receiverId").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => {
    return {
      unique: unique().on(table.receiverId, table.userId),
    };
  },
);
