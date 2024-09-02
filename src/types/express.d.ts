import type { User as appUser } from "../database/schemas/usersSchema";

export {};

declare global {
  namespace Express {
    interface User extends appUser {}
  }
}
