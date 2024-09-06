import db from "../../database";
import { z } from "zod";
import { MyContext } from "../../server";
import { and, eq } from "drizzle-orm";
import { badContentError } from "./errors";
import { profile } from "../../database/schemas";

export const RequestTypeEnum = ["update", "post", "delete"] as const;
const requestObject = z
  .object({
    type: z.enum(RequestTypeEnum),
  })
  .passthrough();

export const CrudProfile = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  const request = requestObject.safeParse(args);
  if (!request.success) return badContentError();

  const argsData = z.object({
    bio: z.string().max(256).optional(),
    profilePic: z.string().optional(),
    backgroundPic: z.string().optional(),
  });

  const safeData = argsData.safeParse(args);
  console.log(safeData.error);
  if (!safeData.success) return badContentError();

  const data = await db
    .insert(profile)
    .values({
      bio: safeData.data.bio,
      profilePic: safeData.data.profilePic,
      backgroundPic: safeData.data.backgroundPic,
      userId: context.user.id,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        backgroundPic: safeData.data.backgroundPic,
        bio: safeData.data.bio,
        profilePic: safeData.data.profilePic,
      },
    })
    .returning();

  console.log(data);
  return data[0];
};
