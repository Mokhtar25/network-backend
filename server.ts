import express from "express";
import session from "express-session";
import crypto from "crypto";
import passport, { Profile } from "passport";

import { ApolloServer } from "@apollo/server";
import { Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as GitHubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import { Pool } from "pg";
import path from "path";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import "dotenv/config";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";

console.log(process.env.hi);

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

const verfiy = async (username: string, password: string, done: Function) => {
  const data = await db.query(
    "select * from usernames where username = $1 and password = $2",
    [username, password],
  );

  console.log(data.rows[0]);
  if (!data.rows[0]) return done(null, false);
  return done(null, data.rows[0]);
};

const start = new LocalStrategy(verfiy);
passport.use(start);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (userId, done) => {
  const user = await db.query("select * from usernames where username = $1", [
    userId,
  ]);
  const userI: User = user.rows[0];

  //console.log(user.rows[0], "----------user");
  done(null, userI);
});
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

const loger = (req: Request, res, next) => {
  console.log(req.body);
  next();
};
app.use(loger);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GoogleClientID,
      clientSecret: process.env.GoogleClientSecret,
      callbackURL: "http://localhost:8080/login/google",
    },

    async function (
      __: string,
      _: string,
      profile: GoogleProfile,
      done: passport.DoneCallback,
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
      clientID: process.env.GithubClientID,
      clientSecret: process.env.GithubClientSecret,
      callbackURL: "http://localhost:8080/login/github",
    },
    async function (
      _: any,
      __: any,
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

app.get("/", (req, res) => {
  res.send("<h2>hello, world</h2>");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res, next) => {
    res.send("hi");
    console.log("da");
  },
);

app.get(
  "/login/api/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/login/github",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  },
);

app.get(
  "/login/api/google",
  passport.authenticate("google", { scope: ["profile"] }),
);

app.get(
  "/login/google",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  },
);
app.get("/pro", (req, res, next) => {
  console.log(req.isAuthenticated(), req.session);
  if (req.isAuthenticated()) return res.send("auth ypi are");
  res.send("inot auth");
});

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const log = () => console.log("run");
server.start().then(() => {
  app.use(log, expressMiddleware(server));
  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000`);
  });
});
