import express, { NextFunction } from "express";

import session from "express-session";
// import crypto from "crypto";
//import passport from "passport";

//import env from "../env";
import { ApolloServer } from "@apollo/server";
//import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
//import {
//  Strategy as GitHubStrategy,
//  Profile as GithubProfile,
//} from "passport-github2";
//import { Pool } from "pg";
import path from "path";
//import {
//  Strategy as GoogleStrategy,
//  Profile as GoogleProfile,
//  VerifyCallback,
//  GoogleCallbackParameters,
//} from "passport-google-oauth20";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import bodyParser from "body-parser";
import "dotenv/config";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { loginRouter, User } from "./controllers/auth";
import { typeDefs, resolvers, schema } from "./graphql";
import env from "../env";
import { GraphQLError } from "graphql";

const redisClient = createClient();
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

//export const db = new Pool({
//  host: "localhost", // or wherever the db is hosted
//  user: "moktarali",
//  database: "users_passport",
//  password: "200106",
//  port: 5432, // The default port
//});
//
const app = express();
app.use(express.static(path.join(__dirname, "index")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const loger = (
  req: Express.Request,
  _: Express.Response,
  next: NextFunction,
) => {
  //console.log(req.session.cookie, "---req");
  next();
};
app.use(loger);
app.use(loginRouter);
// prettier-ignore

app.get("/", (_req, res) => {
  res.send("<h2>hello, world</h2>");
});
const httpServer = http.createServer(app);
export interface MyContext {
  user: Express.User;
  isAuthenticated: () => boolean;
}

const server = new ApolloServer<MyContext>({
  schema: schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();
app.use(
  "/graphql",

  express.json(),
  expressMiddleware(server, {
    // eslint-disable-next-line
    context: async ({ req }) => {
      if (!req.isAuthenticated()) {
        throw new GraphQLError("User is not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
            http: { status: 401 },
          },
        });
      }
      return {
        user: req.user,
        isAuthenticated: () => req.isAuthenticated(),
      };
    },
  }),
);
httpServer.listen({ port: env.PORT });
console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
