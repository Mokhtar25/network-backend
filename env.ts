import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  PORT: z.coerce.number().min(1000),

  GithubClientID: z.string().min(1),

  GithubClientSecret: z.string().min(1),

  GoogleClientID: z.string().min(1),

  GoogleClientSecret: z.string().min(1),

  DATABASE_URI: z.string().min(1),

  ENV: z
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
