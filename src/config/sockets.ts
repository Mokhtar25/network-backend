import util from "util";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import env from "../../env";
import { z } from "zod";
import RedisStore from "connect-redis";
import { Context } from "graphql-ws";
import { Extra } from "graphql-ws/lib/use/ws";

/* parsing the cookie and getting the user from the Redisstore to determine to allow the
 user to connect to the sockets
or not. and if choosing context it gives back the id of the user and pass it as context */
export const socketConfig = async (
  cnxnParams: Context<
    Record<string, unknown> | undefined,
    Extra & Partial<Record<PropertyKey, never>>
  >,
  store: RedisStore,
  type: "context" | "connect",
) => {
  try {
    const cookieStr = cnxnParams.extra.request.headers.cookie;

    // return so it keeps trying
    if (!cookieStr) return;
    const parsedCookie = cookie.parse(cookieStr);

    if (parsedCookie["connect.sid"]) {
      const singedCookie = cookieParser.signedCookie(
        parsedCookie["connect.sid"],
        env.SESSION_SECRET,
      );
      if (!singedCookie) throw new Error("couldnt sign cookie");

      // eslint-disable-next-line
      store.get = util.promisify(store.get);
      const session = await store.get(singedCookie);
      const obj = z.object({
        passport: z.object({
          user: z.number(),
        }),
      });

      const parsedSession = obj.parse(session);
      const user = parsedSession.passport.user;

      console.log("user session data:", JSON.stringify(session));
      return type === "context" ? { user } : true;
    }
    return type === "context" ? { user: null } : false;
  } catch (err) {
    console.log(err, "error parsing or getting cookie");
    return type === "context" ? { user: null } : false;
  }
};
