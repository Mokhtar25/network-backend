CREATE TABLE IF NOT EXISTS "test_network:comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" serial NOT NULL,
	"postId" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:comment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:postsPicture" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"url" varchar(256) NOT NULL,
	CONSTRAINT "test_network:postsPicture_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:postsPicture" ADD CONSTRAINT "test_network:postsPicture_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
