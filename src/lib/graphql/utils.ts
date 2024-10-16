import type { Request } from "express";
import { GraphQLError } from "graphql";
import { MyContext } from "../../types/context";

// prettier-ignore
// eslint-disable-next-line
export const makeGraphqlContext = async ({ req, }: { req: Request; }): Promise<MyContext> => {
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
};
