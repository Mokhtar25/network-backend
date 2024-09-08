import { createTable } from "../schema";
import { integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const profile = createTable("profile", {
  userId: integer("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .primaryKey(),
  profilePic: varchar("ProfilePic", { length: 256 }),
  backgroundPic: varchar("backgroundPic", { length: 256 }),
  bio: text("text"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
