import passport from "passport";
import { Router } from "express";
import type { RequestHandler, NextFunction } from "express";
import env from "../../env";
import "dotenv/config";
import db from "../database";
import { eq } from "drizzle-orm";
import { users } from "../database/schemas";
import { z } from "zod";
import { makeHash } from "../lib/auth/authUtils";

export const routesAuth = Router();

routesAuth.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: env.FAILED_REDIRECT_URL,
    successRedirect: env.SUCCESS_REDIRECT_URL,
  }) as RequestHandler,
  (_req, res) => {
    res.json(_req.user);
    console.log("da");
  },
);

const log = (
  _req: Express.Request,
  _res: Express.Response,
  next: NextFunction,
) => {
  console.log("run logger", _req.user);
  next();
};
routesAuth.use(log);

routesAuth.get(
  "/api/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }) as RequestHandler,
);

routesAuth.post("/signUp", (async (req, res, next) => {
  try {
    console.log(req.body, "sda-------====");
    const type = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });
    const userSchema = type.parse(req.body);

    if (!userSchema.password || !userSchema.username) {
      res.send("Invalid data").status(400);
    }

    const hash = await makeHash(userSchema.password);

    try {
      const user = await db
        .insert(users)
        .values({ username: userSchema.username, password: hash })
        .returning();

      req.login(user[0], (err) => {
        if (err) return next(err);
        return res.redirect(env.SUCCESS_REDIRECT_URL);
      });
      return;
    } catch (err) {
      console.log(err);
      return res.send("Username is taken").status(400);
    }
  } catch (err) {
    console.log(err);
    return res.send("Invalid data").status(400);
  }
}) as RequestHandler);

routesAuth.get(
  "/api/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }) as RequestHandler,
);

// this must match the ones in the .env
routesAuth.get(
  env.CALLBACK_GITHUB_PREFIX,
  passport.authenticate("github", {
    failureRedirect: env.FAILED_REDIRECT_URL,
    successRedirect: env.SUCCESS_REDIRECT_URL,
  }) as RequestHandler,
);

console.log(env.CALLBACK_GITHUB_PREFIX, env.CALLBACK_GOOGLE_PREFIX);
// this must match the ones in the .env
routesAuth.get(
  env.CALLBACK_GOOGLE_PREFIX,
  passport.authenticate("google", {
    failureRedirect: env.FAILED_REDIRECT_URL,
    successRedirect: env.SUCCESS_REDIRECT_URL,
  }) as RequestHandler,
);
routesAuth.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.log("error", err);
      return next(err);
    }
    res.send(200);
  });
});

routesAuth.post("/updateUser", (async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.send(401);

  const updateUserZod = z.object({
    password: z.string().min(1),
  });

  const newUser = updateUserZod.safeParse(req.body);
  if (!newUser.success) return res.send("Missing data").status(401);
  // to do update user password
  await db
    .update(users)
    .set({
      password: await makeHash(newUser.data.password),
    })
    .where(eq(users.id, req.user.id));

  return res.sendStatus(200);
}) as RequestHandler);

routesAuth.get("/pro", (req, res) => {
  console.log(req.isAuthenticated(), req.session.cookie);
  if (req.isAuthenticated())
    return res.send(
      '<h1 style="background-color : black; color : white; height: 100vh;">authenticated<h1>',
    );
  return res.send("not authenticated");
});

routesAuth.get("/me", (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user.id);
  return res.send("not authenticated");
});
