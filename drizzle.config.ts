import { defineConfig } from "drizzle-kit";
import env from "./env";
export default defineConfig({
  schema: "./src/database/schemas/index.ts",
  dialect: "postgresql",
  out: "./src/database/migrations",
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URI,
  },
  strict: true,
});
