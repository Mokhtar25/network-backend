import env from "../../env";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import type { SessionOptions } from "express-session";

const redisClient = createClient({ url: env.REDIS_URI });
redisClient.connect().catch(console.error);

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

const cookieAgeInDays = 7;

export const sessionConfig: SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: redisStore,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * cookieAgeInDays,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  },
};
