import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  message: "too many requests, try again later",
  statusCode: 429,
  legacyHeaders: false,
});
