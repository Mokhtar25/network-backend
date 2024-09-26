import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { NextFunction, RequestHandler, Router } from "express";
import env from "../../env";
import { z } from "zod";
import db from "../database";
import { postsPicture, posts } from "../database/schemas";
import { and, eq, sql } from "drizzle-orm";

const fileRouter = Router();

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_API_SECRET,
});

function auth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    res.send("Unauthorized to handelfiles").status(401);
    console.log("scho");
  }
  next();
}
fileRouter.use(auth);

// do this with help of the frontend
fileRouter.post("/addpics", (async (req, res) => {
  const validData = z.object({
    postId: z.string().uuid(),
    pictures: z.array(z.string()).min(1),
  });
  const safeArgs = validData.safeParse(req.body);
  if (!safeArgs.success || !req.user)
    return res.send("bad content").status(400);

  const subQ = db.$with("subQ").as(
    db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(eq(posts.id, safeArgs.data.postId), eq(posts.userId, req.user.id)),
      ),
  );

  try {
    await Promise.all(
      safeArgs.data.pictures.map(async (e) => {
        const data = await db
          .with(subQ)
          .insert(postsPicture)
          .values({
            postId: sql`(select "id" from "subQ")`,
            url: e,
          });
        console.log(data);
      }),
    );

    return res.status(200);
  } catch (err) {
    console.log(err);
    return res.send("Unauthorized for this action").status(401);
  }
}) as RequestHandler);

fileRouter.post("/getSignUrl", (req, res) => {
  if (!req.isAuthenticated()) return res.send("unAuth");
  const params = z.object({
    fileName: z.string().min(1),
  });
  const body = params.safeParse(req.body);
  if (!body.success) return res.send("Missing content : File name").status(400);

  // timestamp is needed for signature, Valid for an hour
  const timestamp = Math.round(new Date().getTime() / 1000);
  const name = `${req.user.id}_${timestamp}_name:${body.data.fileName}`;
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      public_id: name,
    },
    env.CLOUD_API_SECRET,
  );

  console.log(
    cloudinary.utils.verifyNotificationSignature(name, timestamp, signature),
    "test verfity func",
  );
  return res.json({ timestamp, signature, fileName: name });
});

export default fileRouter;

/// client side
//https://youtu.be/LzMXdnABrCM?si=sd-11sZr5F8wI-dG
//---------------------------------------------
//const url = "http://api.cloudinary.com/v1_1/dyi7q5hhc/image/upload";
//import fs from "fs";
// Read the file from the local file system
//const file = Bun.file("/Users/moktarali/Downloads/rabbit.png");
//// this should work from the client
//const data = new FormData();
//data.append("file", file);
//data.append("api_key", "433753532631739");
//data.append("signature", sign);
//data.append("timestamp", timestamp);
//
//// on upload progess is available in axios§
//const req = await fetch(url, {
//
//  method: "post",
//  body: data,
//});
//const set = await req.json();
//console.log(set);
//fetch(url, {
//  method: "post",
//  body: {
//    timestamp: "here",
//    signature: "there",
//    file: "/Users/moktarali/Downloads/Vector 134.png",
//  },
//});
//------------------------------------------------
//await (async function () {
//  // Configuration
//
//  // Upload an image
//  const uploadResult = await cloudinary.uploader
//    .upload(
//      "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//      {
//        public_id: "shoes",
//      },
//    )
//    .catch((error) => {
//      console.log(error);
//    });
//
//  console.log(uploadResult);
//
//  // Optimize delivery by resizing and applying auto-format and auto-quality
//  const optimizeUrl = cloudinary.url("shoes", {
//    fetch_format: "auto",
//    quality: "auto",
//  });
//
//  console.log(optimizeUrl);
//
//  // Transform the image: auto-crop to square aspect_ratio
//  const autoCropUrl = cloudinary.url("shoes", {
//    crop: "auto",
//    gravity: "auto",
//    width: 500,
//    height: 500,
//  });
//
//  console.log(autoCropUrl);
//})();
