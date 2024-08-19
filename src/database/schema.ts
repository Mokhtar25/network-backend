import {
  pgEnum,
  varchar,
  pgTable,
  serial,
  text,
  timestamp,
  pgTableCreator,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `test_network:${name}`);

export const users = createTable("users_test", {
  id: serial("id").primaryKey().notNull().unique(),
  providerId: varchar("providerId", { length: 256 }),
  name: text("name"),
  password: text("password"),
  username: varchar("username", { length: 256 })
    .unique()
    .default(sql<string>`LOWER($1)`),
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
});

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);

//// Schema for selecting a user - can be used to validate API responses
//const selectUserSchema = createSelectSchema(users);

//// Refining the fields - useful if you want to change the fields before they become nullable/optional in the final schema
//const insertUserSchema = createInsertSchema(users, {
//  id: (schema) => schema.id.positive(),
//  email: (schema) => schema.email.email(),
//  role: z.string(),
//});

// Usage

const user = insertUserSchema.safeParse({
  name: "John Doe",
  email: "johndoe@test.com",
  role: "admin",
});

//console.log(user);
//// Zod schema type is also inferred from the table schema, so you have full type safety
//const requestSchema = insertUserSchema.pick({ name: true, email: true });
