import passport from "passport";
import env from "../../env";
import type { Request } from "express";
import { Router } from "express";
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
import { checkPassword } from "../lib/auth/authUtils";

const passportRouter = Router();

export const verfiy: VerifyFunction = (username, password, done) => {
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
      callbackURL: env.CALLBACK_URL_GOOGLE,
      passReqToCallback: true,
    },
    function (
      _: Request,
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
export async function findOrMake(profile: passport.Profile) {
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
      callbackURL: env.CALLBACK_URL_GITHUB,
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

passportRouter.use(passport.session());

passportRouter.get("/test", (_req, res) => {
  res.send("hi");
});

export default passportRouter;
