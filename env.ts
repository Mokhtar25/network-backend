import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  PORT: z.coerce.number().min(1000),

  GithubClientID: z.string().min(1),

  GithubClientSecret: z.string().min(1),

  GoogleClientID: z.string().min(1),

  GoogleClientSecret: z.string().min(1),

  DATABASE_URI: z.string().url(),
  SESSION_SECRET: z.string().min(25, { message: "Secret should be lengthy" }),

  SUPERBASE_KEY: z.string().min(1),

  SUPERBASE_URL: z.string().url(),

  CLOUD_API_SECRET: z.string().min(1),
  CLOUD_NAME: z.string().min(1),
  CLOUD_API_KEY: z.string().min(1),

  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
  // ...
});

// Validate `process.env` against our schema
// and return the result
const env = envSchema.parse(process.env);

// Export the result so we can use it in the project
export default env;
