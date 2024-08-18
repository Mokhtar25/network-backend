import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  out: "./src/database/migrations",
  verbose: true,
  dbCredentials: {
    url: "postgres://moktarali:200106@localhost:5432/users_passport",
  },
  strict: true,
});
