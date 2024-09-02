import { createTable } from "../schema";
import { primaryKey, serial, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./usersSchema";

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
