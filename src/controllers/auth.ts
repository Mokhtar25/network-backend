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
//import { db } from "../server";
import db from "../database";
import { and, eq } from "drizzle-orm";
import {
  insertUserSchema,
  insertUserSchemaOauth,
  posts,
  selectUserSchema,
  User,
  users,
} from "../database/schema";
import { infer, z } from "zod";
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
    username: z.string().optional(),
    emails: z.array(z.string()).optional(),
  })
  .passthrough();
async function findOrMake(profile: passport.Profile) {
  const userProfile = profileValid.parse(profile);

  console.log("find or make start");
  const data = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.providerId, userProfile.id),
        eq(users.provider, userProfile.provider),
      ),
    );

  if (data.length === 0) {
    const userList = await db
      .insert(users)
      .values({ ...userProfile, providerId: userProfile.id, id: undefined })
      .returning();

    console.log("find or maek done");
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
      _: string,
      __: string,
      profile: GithubProfile,
      done: passport.DoneCallback,
    ) {
      findOrMake(profile)
        .then((e) => {
          done(null, e);
        })
        .catch((err) => done(err));
    },
  ),
);

loginRouter.use(passport.session());

const routesAuth = Router();

routesAuth.get("/test", (_req, res) => {
  res.send("<h2>hello, world auth</h2>");
});

// prettier-ignore
routesAuth.post( "/login", passport.authenticate("local", { failureRedirect: "/" }) as RequestHandler,
  (_req, res ) => {
    res.json(_req.user);
    console.log("da");
  },
);

const log = (
  _req: express.Request,
  _res: express.Response,
  next: NextFunction,
) => {
  console.log("run logger");
  next();
};
routesAuth.use(log);

routesAuth.get(
  "/api/github",
  passport.authenticate("github", { scope: ["user:email"] }) as RequestHandler,
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

    const user = await db
      .insert(users)
      .values({ username: userSchema.username, password: hash })
      .returning();

    req.login(user[0], (err) => {
      if (err) return next(err);
      return res.redirect("pro");
    });
  } catch (err) {
    console.log(err);
    res.send("Invalid data").status(400);
  }
}) as RequestHandler);

routesAuth.get(
  "/api/google",
  passport.authenticate("google", {
    scope: ["profile"],
  }) as RequestHandler,
);

routesAuth.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
  }) as RequestHandler,
  function (_req, res) {
    // Successful authentication, redirect home.
    res.redirect("/auth/pro");
  },
  routesAuth.get(
    "/google",
    passport.authenticate("google", {
      failureRedirect: "/auth/test",
    }) as RequestHandler,
    function (_req, res) {
      // Successful authentication, redirect home.
      res.redirect("/auth/pro");
    },
  ),
);
routesAuth.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send(200);
  });
});

routesAuth.get("/pro", (req, res) => {
  console.log(req.isAuthenticated(), req.session.cookie);
  if (req.isAuthenticated()) return res.send("authenticated");
  return res.send("not authenticated");
});

loginRouter.use("/auth", routesAuth);
