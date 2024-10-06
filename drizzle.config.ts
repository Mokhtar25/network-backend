import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URI || !process.env.TESTING_DATABASE_URI)
  throw new Error("no link was found");

export default defineConfig({
  schema: "./src/database/schemas/index.ts",
  dialect: "postgresql",
  //out: "./src/database/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url:
      process.env.NODE_ENV === "testing"
        ? process.env.TESTING_DATABASE_URI
        : process.env.DATABASE_URI,
  },
});
