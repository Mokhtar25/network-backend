import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  PORT: z.coerce.number().min(1000),

  GithubClientID: z.string().min(1),

  GithubClientSecret: z.string().min(1),

  GoogleClientID: z.string().min(1),

  GoogleClientSecret: z.string().min(1),

  CALLBACK_URL_GITHUB: z.string().url(),
  CALLBACK_URL_GOOGLE: z.string().url(),

  SUCCESS_REDIRECT_URL: z.string().url(),
  FAILED_REDIRECT_URL: z.string().url(),

  DATABASE_URI: z.string().url(),

  TESTING_DATABASE_URI: z.string().url(),
  SESSION_SECRET: z.string().min(25, { message: "Secret should be lengthy" }),

  CORS_ORIGIN: z.string().url(),

  CLOUD_API_SECRET: z.string().min(1),
  CLOUD_NAME: z.string().min(1),
  CLOUD_API_KEY: z.string().min(1),

  CALLBACK_GITHUB_PREFIX: z
    .string()
    .transform((e) => (e.startsWith("/") ? e : "/" + e))
    .refine(
      (e) => {
        if (!process.env.CALLBACK_URL_GITHUB!.endsWith(e)) return false;
        return true;
      },
      { message: "prefix must match the callback url for github" },
    ),

  CALLBACK_GOOGLE_PREFIX: z
    .string()
    .transform((e) => (e.startsWith("/") ? e : "/" + e))
    .refine(
      (e) => {
        if (!process.env.CALLBACK_URL_GOOGLE!.endsWith(e)) return false;
        return true;
      },
      { message: "prefix must match the callback url for google" },
    ),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("test"),
      z.literal("production"),
    ])
    .default("development"),
});

// Validate `process.env` against our schema
// and return the result
const env = envSchema.parse(process.env);

// Export the result so we can use it in the project
export default env;
