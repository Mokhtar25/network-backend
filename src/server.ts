import express from "express";
import type { Request, Response, NextFunction } from "express";

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
import cors from "cors";
import "dotenv/config";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { loginRouter, User } from "./controllers/auth";
import { typeDefs, resolvers, schema } from "./graphql";
import env from "../env";
import { GraphQLError } from "graphql";
import fileRouter from "./controllers/fileManger";
import helmet from "helmet";
// web sockets
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

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

//app.use(
//  helmet({
//    crossOriginEmbedderPolicy: false,
//    contentSecurityPolicy: {
//      directives: {
//        imgSrc: [
//          `'self'`,
//          "data:",
//          "apollo-server-landing-page.cdn.apollographql.com",
//        ],
//        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
//        manifestSrc: [
//          `'self'`,
//          "apollo-server-landing-page.cdn.apollographql.com",
//        ],
//        frameSrc: [`'self'`, "sandbox.embed.apollographql.com"],
//      },
//    },
//  }),
//);
//app.use(helmet.hidePoweredBy());
//app.use(helmet.frameguard({ action: "deny" }));
//app.use(helmet.xssFilter());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "asdkosadakods;",
    resave: false,
    saveUninitialized: true,
    store: redisStore,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

const loger = (
  req: Express.Request,
  _: Express.Response,
  next: NextFunction,
) => {
  console.log(req.user, "---req");
  next();
};

app.use(loger);
app.use(loginRouter);
app.use("/files", fileRouter);
// prettier-ignore

app.get("/", (_req, res) => {
  res.send("<h2>hello, world</h2>");
});
const httpServer = http.createServer(app);
export interface MyContext {
  user: Express.User;
  isAuthenticated: () => boolean;
}
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer, 0);

const server = new ApolloServer<MyContext>({
  schema: schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
await server.start();
app.use(
  "/graphql",

  express.json(),
  expressMiddleware(server, {
    // apollo context requires a promise
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
        user: { id: 1 },
        isAuthenticated: () => req.isAuthenticated(),
      };
    },
  }),
);
// todo more logic goes in here to identify error
const errorHandler = (err, _: Request, res: Response, __: NextFunction) => {
  console.log(err);
  res.send("error has ouccred").status(501);
};
app.use(errorHandler);
httpServer.listen({ port: env.PORT });
console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
