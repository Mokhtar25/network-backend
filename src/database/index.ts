import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import env from "../../env";
//
//export const pool = new Pool({
//  host: "localhost", // or wherever the db is hosted
//  user: "moktarali",
//  database: "users_passport",
//  password: "200106",
//  port: 5432, // The default port
//});
const pool = new Pool({
  connectionString: env.DATABASE_URI,
});

const db = drizzle(pool, { schema });

export default db;
