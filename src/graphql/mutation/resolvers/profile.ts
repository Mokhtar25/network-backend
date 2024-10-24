import db from "../../../database";
import { z } from "zod";
import type { MyContext } from "../../../types/context";
import { badContentError } from "./errors";
import { profile } from "../../../database/schemas";

// move the sending of the pictures to graphql, sign the pictures and
// and send them with the initial request
export const CrudProfile = async (
  _: unknown,
  args: unknown,
  context: MyContext,
) => {
  // check when to update and when to add stuff/or make its on the Frontend to send which fields
  //  if you don't provide the field it wont be changed. so that is good and is left to the Frontend
  const argsData = z
    .object({
      bio: z.string().max(256).optional(),
      profilePic: z.string().optional(),
      backgroundPic: z.string().optional(),
    })
    .passthrough();

  const safeData = argsData.safeParse(args);
  console.log(safeData.error);
  if (!safeData.success) return badContentError();

  console.log(safeData);
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

  console.log(data, "returned -----------");
  return data[0];
};
