import { createTable } from "../schema";
import { uuid, serial, unique, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./usersSchema";

export const chats = createTable(
  "chats",
  {
    id: uuid("id").primaryKey(),
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
  },
  (table) => {
    return {
      unique: unique().on(table.reciverId, table.userId),
    };
  },
);
