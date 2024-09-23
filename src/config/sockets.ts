import util from "util";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import { RedisClientType, RedisClusterType } from "redis";
import env from "../../env";
import { z } from "zod";

export const socketConfig = async (
  cnxnParams: unknown,
  store: RedisClusterType,
  type: "context" | "connect",
) => {
  try {
    const cookieStr: string | undefined =
      cnxnParams.extra.request.headers.cookie;

    // return null so it keeps trying
    if (!cookieStr) return null;
    const parsedCookie = cookie.parse(cookieStr);

    if (parsedCookie["connect.sid"]) {
      const singedCookie = cookieParser.signedCookie(
        parsedCookie["connect.sid"],
        env.SESSION_SECRET,
      );
      if (!singedCookie) throw new Error("couldnt sign cookie");

      // @ts-expect-error need to find the correct type
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
      return { user };
    }
  } catch (err) {
    console.log(err, "error parsing or getting cookie");
    return { user: null };
  }
};
