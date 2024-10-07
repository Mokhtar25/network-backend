import type { Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
//import * as schema from "./schemas/";
import { getTableName, sql } from "drizzle-orm";

//type schemaType = typeof schema;
export async function turbTable(db: NodePgDatabase, table: Table) {
  await db.execute(
    sql.raw(`TRUNCATE TABLE "${getTableName(table)}" RESTART IDENTITY CASCADE`),
  );
}
