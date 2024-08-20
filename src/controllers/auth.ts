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
import dbs from "../database";
import { and, eq } from "drizzle-orm";
import {
  insertUserSchema,
  insertUserSchemaOauth,
  selectUserSchema,
  User,
  users,
} from "../database/schema";
import { infer, z } from "zod";

export const loginRouter = Router();

//export interface User {
//  username: string;
//  password: string;
//  id: string;
//}

const verfiy: VerifyFunction = (username, password, done) => {
  console.log("run ", username, password);
  dbs
    .select()
    .from(users)
    .where(and(eq(users.username, username), eq(users.password, password)))
    .then((res) => {
      if (!res[0]) {
        done(null, false);
      } else {
        done(null, res[0]);
      }
    })
    .catch((err) => done(err));
};

const start = new LocalStrategy(verfiy);
passport.use(start);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  const da = await dbs.select().from(users).where(eq(users.id, userId));

  //console.log(da[0], " irs herer");

  if (!da[0]) return done(null, false);
  return done(null, da[0]);
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

      return;
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

  const data = await dbs
    .select()
    .from(users)
    .where(
      and(
        eq(users.providerId, userProfile.id),
        eq(users.provider, userProfile.provider),
      ),
    );

  if (data.length === 0) {
    const userList = await dbs
      .insert(users)
      .values({ ...userProfile, providerId: userProfile.id, id: undefined })
      .returning();

    return userList[0];
  }
  return data[0];
}

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
      console.log(profile);
      const datas = await findOrMake({ ...profile, name: profile.displayName });

      console.log(datas);
      done(null, datas);
      return;
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
routesAuth.get("/pro", (req, res) => {
  console.log(req.isAuthenticated(), req.session.cookie);
  if (req.isAuthenticated()) return res.send("authenticated");
  return res.send("not authenticated");
});

loginRouter.use("/auth", routesAuth);
