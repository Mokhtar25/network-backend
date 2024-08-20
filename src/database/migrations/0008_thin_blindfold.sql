CREATE TABLE IF NOT EXISTS "test_network:like" (
	"userId" serial NOT NULL,
	"postId" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
ALTER TABLE "test_network:posts" DROP COLUMN IF EXISTS "username";
