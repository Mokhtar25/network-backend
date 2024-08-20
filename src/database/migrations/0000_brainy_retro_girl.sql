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
CREATE TABLE IF NOT EXISTS "test_network:like" (
	"userId" serial NOT NULL,
	"postId" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" serial NOT NULL,
	"textContent" text,
	"likesCount" integer DEFAULT 0,
	"commentCount" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:posts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:postsPicture" (
	"postId" uuid NOT NULL,
	"url" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:users_test" (
	"id" serial PRIMARY KEY NOT NULL,
	"providerId" varchar(256),
	"name" text,
	"password" text,
	"username" varchar(256),
	"email" text,
	"description" text,
	"provider" text DEFAULT 'local',
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:users_test_id_unique" UNIQUE("id"),
	CONSTRAINT "test_network:users_test_username_unique" UNIQUE("username")
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
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:posts" ADD CONSTRAINT "test_network:posts_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:postsPicture" ADD CONSTRAINT "test_network:postsPicture_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
