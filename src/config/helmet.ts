import type { HelmetOptions } from "helmet";
export const helmetConfig: HelmetOptions = {
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
};
