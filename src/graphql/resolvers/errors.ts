import { GraphQLError } from "graphql";

export const badContentError = (message?: string) => {
  const text = message ?? "Missing content";
  throw new GraphQLError(text, {
    extensions: {
      code: "Bad Request",
      http: { status: 400 },
    },
  });
};

export const notAuthError = (user: unknown) => {
  if (!user)
    throw new GraphQLError("unAuthorized", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
};
