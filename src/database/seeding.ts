import type { Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas/";
import { getTableName, sql } from "drizzle-orm";
import { makeHash } from "../lib/auth/authUtils";
import { User } from "./schemas/users";

type schemaType = typeof schema;
export async function turbTable(db: NodePgDatabase<schemaType>, table: Table) {
  await db.execute(
    sql.raw(`TRUNCATE TABLE "${getTableName(table)}" RESTART IDENTITY CASCADE`),
  );
}

export async function seedDb(db: NodePgDatabase<schemaType>) {
  await Promise.all([turbTable(db, schema.users), turbTable(db, schema.posts)]);

  const password = await makeHash("test");

  const seededUsers = [];
  for (let i = 0; i < 4; i++) {
    const user = await db
      .insert(schema.users)
      .values({
        username: `test${i}`,
        provider: "local",
        password: password,
      })
      .returning();

    seededUsers.push(user[0]);
  }

  const seededProfiles = [];

  for (let i = 0; i < 4; i++) {
    const profile = await db
      .insert(schema.profile)
      .values({
        userId: seededUsers[i].id,
        bio: "test profile",
      })
      .returning();

    seededProfiles.push(profile[0]);
  }

  const seededPosts = [];

  for (let i = 0; i < 4; i++) {
    const post = await db
      .insert(schema.posts)
      .values({
        userId: seededUsers[i].id,
        textContent: "test post",
      })
      .returning();

    seededPosts.push(post[0]);
  }

  const seededLikes = [];

  for (let i = 0; i < 4; i++) {
    const like = await db
      .insert(schema.like)
      .values({
        userId: seededUsers[i].id,
        postId: seededPosts[i].id,
      })
      .returning();

    seededLikes.push(like[0]);
  }

  const seededComments = [];

  for (let i = 0; i < 4; i++) {
    const comment = await db
      .insert(schema.comment)
      .values({
        userId: seededUsers[i].id,
        content: "test comment",
        postId: seededPosts[i].id,
      })
      .returning();

    seededComments.push(comment[0]);
  }

  const seeded = [];

  for (let i = 0; i < 4; i++) {
    const comment = await db
      .insert(schema.message)
      .values({
        userId: seededUsers[i].id,
        content: "test comment",
        postId: seededPosts[i].id,
      })
      .returning();

    seededComments.push(comment[0]);
  }
}
