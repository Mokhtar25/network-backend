DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('commnet', 'like', 'request', 'acceptRequest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
