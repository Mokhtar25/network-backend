DO $$ BEGIN
 CREATE TYPE "public"."messageType" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
