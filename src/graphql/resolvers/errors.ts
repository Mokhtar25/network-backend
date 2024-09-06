import { GraphQLError } from "graphql";

export const badContentError = () => {
  throw new GraphQLError("Missing content", {
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
