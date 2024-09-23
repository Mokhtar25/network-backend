import express from "express";
import type { Request, Response, NextFunction } from "express";

import session, { Cookie } from "express-session";
import { ApolloServer } from "@apollo/server";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import "dotenv/config";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { loginRouter } from "./controllers/auth";
import { schema } from "./graphql";
import env from "../env";
import { GraphQLError } from "graphql";
import fileRouter from "./controllers/fileManger";
import helmet from "helmet";
import cookie from "cookie";
import cookieParser from "cookie-parser";

// web sockets
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

const redisClient = createClient();
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        // allow Apollo server playground
        imgSrc: [
          `'self'`,
          "data:",
          "apollo-server-landing-page.cdn.apollographql.com",
        ],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        manifestSrc: [
          `'self'`,
          "apollo-server-landing-page.cdn.apollographql.com",
        ],
        frameSrc: [`'self'`, "sandbox.embed.apollographql.com"],
      },
    },
  }),
);

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
    secret: env.SESSION_SECRET,
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

app.use(loginRouter);
app.use("/files", fileRouter);
const loger = (
  req: Express.Request,
  _: Express.Response,
  next: NextFunction,
) => {
  console.log(req.user, "---req");
  next();
};
app.use(loger);

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
// the 0 is a bug in Bun, need a zero to work in bun
const serverCleanup = useServer(
  {
    schema,
    onConnect: (cnxnParams, webSocket, cnxnContext) => {
      const cookieStr = cnxnParams.extra.request.headers.cookie;
      if (!cookieStr) return null;
      console.log("hi", cnxnParams.extra.request.headers);
      console.log(typeof cookieStr);
      const parsedCookie = cookie.parse(cookieStr);
      console.log("parsed", parsedCookie.sid);
      if (parsedCookie["connect.sid"]) {
        console.log("inside");
        const singedCookie = cookieParser.signedCookie(
          parsedCookie["connect.sid"],
          env.SESSION_SECRET,
        );
        console.log(singedCookie, "sadss singed");
        redisStore.get(singedCookie, (err, session) => {
          if (err) throw err;

          const user = session.passport.user;
          console.log(user);
          console.log("user session data:", JSON.stringify(session));
        });
      }
      return {
        loginUser: 0,
      };
    },
    // under development
    context: (ctx, msg, args) => {
      //console.log(ctx.extra.request, "args from adsoidsa");
      return true;
    },
  },
  wsServer,
  0,
);

const server = new ApolloServer<MyContext>({
  schema: schema,

  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      // has to be async
      // eslint-disable-next-line
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
        user: req.user,
        isAuthenticated: () => req.isAuthenticated(),
      };
    },
  }),
);
// todo more logic goes in here to identify error
const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  console.log(err);
  res.send(`error has ouccred, ${err.message}`).status(501);
};
app.use(errorHandler);
httpServer.listen({ port: env.PORT });
console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
