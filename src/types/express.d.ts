import type { User as appUser } from "../database/schemas/users";

export {};

declare global {
  namespace Express {
    interface User extends appUser {
      // must add this or typescript will start bitching
      foo?;
    }
  }
}
