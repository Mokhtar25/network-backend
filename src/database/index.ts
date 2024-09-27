import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas/index";
import * as _relations from "./relations";
import env from "../../env";

const pool = new Pool({
  connectionString: env.DATABASE_URI,
});

const db = drizzle(pool, { schema, logger: true });

export default db;
