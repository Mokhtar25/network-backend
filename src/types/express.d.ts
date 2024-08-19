import type { User as appUser } from "../database/schema";

export {};

declare global {
  namespace Express {
    interface User extends appUser {}
  }
}
