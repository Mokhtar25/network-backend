import { createTable } from "../schema";

import { varchar, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const users = createTable(
  "users_test",
  {
    id: serial("id").primaryKey().notNull().unique(),
    providerId: varchar("providerId", { length: 256 }),
    displayName: text("displayName"),
    password: text("password"),
    username: varchar("username", { length: 256 }).unique(),
    email: text("email"),
    description: text("description"),
    provider: text("provider", { enum: ["github", "google", "local"] }).default(
      "local",
    ),
    role: text("role", { enum: ["admin", "user"] })
      .notNull()
      .default("user"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => {
    return {
      uniquieUsernameWithAuth: unique("provider and username").on(
        table.username,
        table.provider,
      ),
    };
  },
);

export type User = typeof users.$inferSelect; // return type when queried

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserSchemaOauth = createInsertSchema(users, {
  providerId: z.string().or(z.number()),
  role: z.string(),
});
//// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);

//// Refining the fields - useful if you want to change the fields before they become nullable/optional in the final schem

//const insertUserSchema = createInsertSchema(users, {
//  id: (schema) => schema.id.positive(),
//  email: (schema) => schema.email.email(),
//  role: z.string(),
//});

//console.log(user);
/// schema type is also inferred from the table schema, so you have full type safety

//const requestSchema = insertUserSchema.pick({
//  displayName: true,
//  email: true,
//});
