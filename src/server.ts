//import "dotenv/config"; only needed in node
//libs
import express from "express";
import type { Request, Response, NextFunction } from "express";
import session from "express-session";
import { ApolloServer } from "@apollo/server";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import helmet from "helmet";

import env from "../env";
import { schema } from "./graphql";
import type { MyContext } from "./types/context";

// routes
import passportRouter from "./config/passport";
import fileRouter from "./controllers/fileManger";
import { routesAuth } from "./controllers/auth";

// web sockets
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

//configs
import { socketConfig } from "./config/sockets";
import { rateLimiter } from "./config/rateLimit";
import { helmetConfig } from "./config/helmet";
import { redisStore, sessionConfig } from "./config/session";
import { makeGraphqlContext } from "./lib/graphql/utils";

export const app = express();

app.use(rateLimiter);
app.use(helmet(helmetConfig));

if (env.NODE_ENV === "production")
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passportRouter);

const loger = (req: Request, _: Response, next: NextFunction) => {
  console.log(req.user, "---req");
  next();
};
app.use(loger);

// routes
app.use("/auth", routesAuth);
app.use("/files", fileRouter);

app.get("/", (_req, res) => {
  res.sendStatus(200);
});

export const httpServer = http.createServer(app);

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
    context: makeGraphqlContext,
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
