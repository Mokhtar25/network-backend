import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas/index";
import * as _relations from "./relations";
import env from "../../env";

export const pool = new Pool({
  connectionString:
    env.NODE_ENV === "test" ? env.TESTING_DATABASE_URI : env.DATABASE_URI,
});

const db = drizzle(pool, { schema, logger: env.NODE_ENV !== "test" });

export default db;
