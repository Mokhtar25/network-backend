import { createTable } from "../schema";
import { integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const followers = createTable(
  "following",
  {
    userId: integer("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followeId: integer("id")
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
