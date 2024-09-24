import passport from "passport";
import express, { Router, RequestHandler, NextFunction } from "express";

import env from "../../env";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import {
  Strategy as GitHubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
  GoogleCallbackParameters,
} from "passport-google-oauth20";
import "dotenv/config";
import db from "../database";
import { and, eq } from "drizzle-orm";
import { users } from "../database/schemas";
import { z } from "zod";
import { checkPassword, makeHash } from "../lib/auth/authUtils";

export const loginRouter = Router();

const verfiy: VerifyFunction = (username, password, done) => {
  db.select()
    .from(users)
    .where(and(eq(users.username, username)))
    .then((res) => {
      console.log("got user");
      if (!res[0] || !res[0].password) {
        console.log("false pass");
        return done(null, false);
      } else {
        console.log("chech pass");
        checkPassword(password, res[0].password)
          .then((correct) => {
            if (correct) {
              return done(null, res[0]);
            } else {
              done(null, false);
            }
          })
          .catch((err) => done(err));
      }
    })
    .catch((err) => done(err));
};

const start = new LocalStrategy(verfiy);
passport.use(start);

passport.serializeUser((user, done) => {
  console.log("run");
  done(null, user.id);
});

passport.deserializeUser((userId: number, done) => {
  db.select()
    .from(users)
    .where(eq(users.id, userId))
    .then((res) => {
      if (!res[0]) return done(null, false);
      done(null, res[0]);
    })
    .catch((err) => done(err));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GoogleClientID,
      clientSecret: env.GoogleClientSecret,
      callbackURL: "http://localhost:4000/auth/google",
      passReqToCallback: true,
    },
    function (
      _: express.Request,
      __: string,
      ___: string,
      ____: GoogleCallbackParameters,
      profile: GoogleProfile,
      done: VerifyCallback,
    ) {
      const parseEmails = z
        .object({
          emails: z.array(
            z.object({
              value: z.string(),
            }),
          ),
        })
        .passthrough();
      const emails = parseEmails.safeParse(profile);

      if (emails.success) {
        // @ts-expect-error annoying to deal with, this is how the data is coming from google
        profile.emails = [emails.data.emails[0].value];
      }

      console.log(profile.emails);
      findOrMake(profile)
        .then((data) => done(null, data))
        .catch((err) => done(err));
    },
  ),
);

const profileValid = z
  .object({
    id: z.string(),
    provider: z.enum(["github", "google"]),
    displayName: z.string().optional().nullish(),
    username: z.string().toLowerCase().optional(),
    emails: z.array(z.string()),
  })
  .passthrough();
async function findOrMake(profile: passport.Profile) {
  const userProfile = profileValid.parse(profile);

  console.log("find or make start", userProfile);
  const data = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.providerId, userProfile.id),
        eq(users.provider, userProfile.provider),
      ),
    );

  console.log(data.length);
  if (data.length === 0) {
    const userList = await db
      .insert(users)
      .values({
        ...userProfile,
        providerId: userProfile.id,
        id: undefined,
        email: userProfile.emails[0],
      })
      .returning();

    console.log("find or make done");
    return userList[0];
  }

  console.log("find or maek done");
  return data[0];
}

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GithubClientID,
      clientSecret: env.GithubClientSecret,
      callbackURL: "http://localhost:4000/auth/github/callback",
    },
    function (
      token: string,
      _refreshToken: string,
      profile: GithubProfile,
      done: passport.DoneCallback,
    ) {
      //this is how you get users email in github
      const headers = new Headers();
      headers.set("Authorization", "Bearer " + token);

      fetch(`https://api.github.com/user/emails`, {
        method: "get",
        headers: headers,
      })
        .then((re) => re.json())
        .then((re) => {
          const parseEmail = z.array(z.object({ email: z.string() }));
          const emails = parseEmail.safeParse(re);

          // @ts-expect-error data from github
          if (emails.success) profile.emails = [emails.data[0].email];
          findOrMake(profile)
            .then((e) => {
              done(null, e);
            })
            .catch((err) => done(err));
        })
        .catch((er) => console.log(er, "error"));
    },
  ),
);

loginRouter.use(passport.session());

const routesAuth = Router();

routesAuth.get("/test", (_req, res) => {
  res.send("<h2>hello, world auth</h2>");
});

routesAuth.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
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
        return res.redirect("pro");
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

routesAuth.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: "/auth/pro",
  }) as RequestHandler,
);
routesAuth.get(
  "/google",
  passport.authenticate("google", {
    failureRedirect: "/auth/test",
    successRedirect: "pro",
  }) as RequestHandler,
);
routesAuth.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
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
  if (req.isAuthenticated()) return res.send("authenticated");
  return res.send("not authenticated");
});

loginRouter.use("/auth", routesAuth);
