DO $$ BEGIN
 CREATE TYPE "public"."messageType" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('commnet', 'follow', 'like');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
