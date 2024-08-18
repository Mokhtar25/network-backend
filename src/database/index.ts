import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const pool = new Pool({
  host: "localhost", // or wherever the db is hosted
  user: "moktarali",
  database: "users_passport",
  password: "200106",
  port: 5432, // The default port
});

const dbs = drizzle(pool, { schema, logger: true });

export default dbs;
