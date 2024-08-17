import express, { NextFunction, RequestHandler } from "express";
import session from "express-session";
// import crypto from "crypto";
import passport from "passport";

import env from "../env";
import { ApolloServer } from "@apollo/server";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import {
  Strategy as GitHubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import { Pool } from "pg";
import path from "path";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
  GoogleCallbackParameters,
} from "passport-google-oauth20";
import RedisStore, { RedisStore as RedisStoreInterface } from "connect-redis";
import { createClient } from "redis";
import "dotenv/config";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";

const redisClient = createClient();
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const db = new Pool({
  host: "localhost", // or wherever the db is hosted
  user: "moktarali",
  database: "users_passport",
  password: "200106",
  port: 5432, // The default port
});

const app = express();
app.use(express.static(path.join(__dirname, "index")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface User {
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
    .catch(() => done(null, false));
};

const start = new LocalStrategy(verfiy);
passport.use(start);

passport.serializeUser((user, done) => {
  console.log("run ser", user);

  done(null, (user as User).username);
});

//passport.deserializeUser(async (userId, done) => {
//  const user = await db.query("select * from usernames where username = $1", [
//    userId,
//  ]);
//  if (!user.rows[0]) done(null, false);
//  const userI = user.rows[0] as User;
//
//  //console.log(user.rows[0], "----------user");
//  done(null, userI);
//});
app.use(
  session({
    secret: "asdkosadakods;",
    resave: false,
    saveUninitialized: true,
    store: redisStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

passport.deserializeUser((userId, done) => {
  db.query("select * from usernames where username = $1", [userId])
    .then((result) => {
      if (!result.rows[0]) return done(null, false);

      const user = result.rows[0] as User;
      done(null, user);
    })
    .catch((err) => done(err, null));
});

// prettier-ignore
const loger = ( req: Express.Request, _: Express.Response, next: NextFunction,) => {
  console.log(req.user);
  next();
};

app.use(loger);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GoogleClientID,
      clientSecret: env.GithubClientSecret,
      callbackURL: "http://localhost:8080/login/google",
      passReqToCallback: true,
    },

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async function (
      _: express.Request,
      __: string,
      ___: string,
      ____: GoogleCallbackParameters,
      profile: GoogleProfile,
      done: VerifyCallback,
    ) {
      const data = await db.query(
        "select * from usernames where username = $1",
        [profile.id],
      );
      console.log(data.rows[0], "------------- find");
      if (!data.rows[0]) {
        console.log(profile.id);
        console.log("create ================================");
        await db.query(
          "insert into usernames (username, password) values ($1, 'google')",
          [profile.id],
        );

        const res = await db.query(
          "select * from usernames where username = $1",
          [profile.id],
        );
        console.log(res, "---------------------------");

        return done(null, res.rows[0]);
      }
      return done(null, data.rows[0]);
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GithubClientID,
      clientSecret: env.GithubClientSecret,
      callbackURL: "http://localhost:8080/login/github",
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async function (
      _: string,
      __: string,
      profile: GithubProfile,
      done: passport.DoneCallback,
    ) {
      const data = await db.query(
        "select * from usernames where username = $1",
        [profile.username],
      );
      console.log(data.rows[0], "------------- find");
      console.log(profile);
      if (!data.rows[0]) {
        console.log("create ================================");
        const res = await db.query(
          "insert into usernames (username, password) values ($1, 'github')",
          [profile.username],
        );
        console.log(res.rows[0], "---------------------------");
        return done(null, res.rows[0]);
      }
      return done(null, data.rows[0]);
    },
  ),
);

app.use(passport.session());

app.get("/", (_req, res) => {
  res.send("<h2>hello, world</h2>");
});

app.get("/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// prettier-ignore
app.post( "/login", passport.authenticate("local", { failureRedirect: "/" }) as RequestHandler,
  (_req, res ) => {
    res.send("hi");
    console.log("da");
  },
);

app.get(
  "/login/api/github",
  passport.authenticate("github", { scope: ["user:email"] }) as RequestHandler,
);

// app.get(
//   "/login/github",
//   passport.authenticate("github", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/");
//   },
// );

app.get(
  "/login/api/google",
  passport.authenticate("google", {
    scope: ["profile"],
  }) as express.RequestHandler,
);

app.get(
  "/login/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }) as express.RequestHandler,
  function (_req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  },
);
app.get("/pro", (req, res) => {
  console.log(req.isAuthenticated(), req.session);
  if (req.isAuthenticated()) return res.send("auth ypi are");
  return res.send("inot auth");
});

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

void server.start().then(() => {
  app.use(expressMiddleware(server));
  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000`);
  });
});
