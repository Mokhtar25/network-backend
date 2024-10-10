//import "dotenv/config"; only needed in node
import express from "express";
import type { Request, Response, NextFunction } from "express";

import session from "express-session";
import { ApolloServer } from "@apollo/server";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";

import passportRouter from "./config/passport";
import { schema } from "./graphql";
import env from "../env";
import { GraphQLError } from "graphql";
import helmet from "helmet";
// routes
import fileRouter from "./controllers/fileManger";
import { routesAuth } from "./controllers/auth";

// web sockets
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { socketConfig } from "./config/sockets";
import { rateLimiter } from "./config/rateLimit";
import { helmetConfig } from "./config/helmet";

const redisClient = createClient();
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

export const app = express();

app.use(rateLimiter);

app.use(helmet(helmetConfig));

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

// passport config
app.use(passportRouter);

const loger = (
  req: Express.Request,
  _: Express.Response,
  next: NextFunction,
) => {
  console.log(req.user, "---req");
  next();
};
app.use(loger);

// routes
app.use("/auth", routesAuth);
app.use("/files", fileRouter);

app.get("/", (_req, res) => {
  res.send("<h2>hello, world</h2>");
});
export const httpServer = http.createServer(app);

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
    onConnect: async (ctx) => {
      return socketConfig(ctx, redisStore, "connect");
    },
    context: async (ctx) => {
      return socketConfig(ctx, redisStore, "context");
    },
  },
  wsServer,
  0,
);

export const server = new ApolloServer<MyContext>({
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
// TODO more logic goes in here to identify error
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err, "Error handler func ------");
  res.send(`an error has ouccred, ${err.message}`).status(501);
};
app.use(errorHandler);
// to run testing while running the program so ports don't collide
const PORT = env.NODE_ENV === "test" ? env.PORT + 1 : env.PORT;
httpServer.listen({ port: PORT });
console.log(`🚀 Server ready at http://localhost:${PORT}`);
