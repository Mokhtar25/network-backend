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
import { db } from "../server";
import dbs from "../database";
import { eq } from "drizzle-orm";
import { users } from "../database/schema";

export const loginRouter = Router();

export interface User {
  username: string;
  password: string;
  id: string;
}

const verfiy: VerifyFunction = (username, password, done) => {
  const dataFunc = async () => {
    const data = await db.query(
      "select * from usernames where username = $1 and password = $2",
      [username, password],
    );

    return data;
  };
  dataFunc()
    .then((data) => {
      if (!data.rows[0]) done(null, false);
      else {
        done(null, data.rows[0] as User);
      }
    })
    .catch((err) => done(err, false));
};

const start = new LocalStrategy(verfiy);
passport.use(start);

passport.serializeUser((user, done) => {
  console.log("run ser", user);

  done(null, (user as User).username);
});

passport.deserializeUser((userId, done) => {
  db.query("select * from usernames where username = $1", [userId])
    .then((result) => {
      if (!result.rows[0]) return done(null, false);

      const user = result.rows[0] as User;
      done(null, user);
    })
    .catch((err) => done(err, null));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GoogleClientID,
      clientSecret: env.GoogleClientSecret,
      callbackURL: "http://localhost:8080/login/google",
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
      // First query to check if the user exists
      db.query("SELECT * FROM usernames WHERE username = $1", [profile.id])
        .then((data) => {
          // If user does not exist, insert the new user
          if (!data.rows[0]) {
            return db
              .query(
                "INSERT INTO usernames (username, password) VALUES ($1, 'google')",
                [profile.id],
              )
              .then(() => {
                // Query again to get the newly created user
                return db.query("SELECT * FROM usernames WHERE username = $1", [
                  profile.id,
                ]);
              })
              .then((res) => {
                // Pass the new user to the done callback
                return done(null, res.rows[0] as User);
              });
          }
          // If user exists, pass the existing user to the done callback
          return done(null, data.rows[0] as User);
        })
        .catch((err) => {
          // Handle any errors by passing them to the done callback
          console.error(err);
          return done(err);
        });
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GithubClientID,
      clientSecret: env.GithubClientSecret,
      callbackURL: "http://localhost:4000/auth/github/callback",
    },
    // eslint-disable-next-line
    async function (
      _: string,
      __: string,
      profile: GithubProfile,
      done: passport.DoneCallback,
    ) {
      const data = await dbs
        .select()
        .from(users)
        .where(eq(users.username, profile.username));

      if (data.length === 0) {
        console.log(profile);
        const userList = await dbs
          .insert(users)
          .values({
            name: profile.name ?? "adam",
            username: profile.username,
            email: profile.emails && profile.emails[0],
            role: "user",
          })
          .returning();

        const user = userList[0];
        console.log(userList);

        return done(null, user);
      }

      console.log(data);
      return done(null, data[0]);

      // Query to find the user by GitHub username
      db.query("SELECT * FROM usernames WHERE username = $1", [
        profile.username,
      ])
        .then((data) => {
          console.log(data.rows[0], "------------- find");
          console.log(profile);

          // If user does not exist, insert the new user
          if (!data.rows[0]) {
            console.log("create ================================");

            return db
              .query(
                "INSERT INTO usernames (username, password) VALUES ($1, 'github')",
                [profile.username],
              )
              .then(() => {
                // Return the newly inserted user
                return db.query("SELECT * FROM usernames WHERE username = $1", [
                  profile.username,
                ]);
              })
              .then((res) => {
                console.log(res.rows[0], "---------------------------");
                return done(null, res.rows[0] as User);
              });
          }

          // If user exists, pass the existing user to the done callback
          return done(null, data.rows[0] as User);
        })
        .catch((err) => {
          // Handle any errors by passing them to the done callback
          console.error(err);
          return done(err);
        });
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
    res.send("hi");
    console.log("da");
  },
);

const log = (
  _req: express.Request,
  _res: express.Response,
  next: NextFunction,
) => {
  console.log("run");
  next();
};
routesAuth.use(log);

routesAuth.get(
  "/api/github",
  passport.authenticate("github", { scope: ["user:email"] }) as RequestHandler,
);

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
    res.redirect("/login/pro");
  },
  routesAuth.get(
    "/google",
    passport.authenticate("google", {
      failureRedirect: "/login",
    }) as RequestHandler,
    function (_req, res) {
      // Successful authentication, redirect home.
      res.redirect("/");
    },
  ),
);
routesAuth.get("/pro", (req, res) => {
  console.log(req.isAuthenticated(), req.session);
  if (req.isAuthenticated()) return res.send("authenticated");
  return res.send("not authenticated");
});

loginRouter.use("/auth", routesAuth);
