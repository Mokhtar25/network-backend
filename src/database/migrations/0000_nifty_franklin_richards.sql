DO $$ BEGIN
 CREATE TYPE "public"."messageType" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('commnet', 'follow', 'like', 'message');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"receiverId" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:chats_receiverId_userId_unique" UNIQUE("receiverId","userId")
);
--> statement-breakpoint
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
CREATE TABLE IF NOT EXISTS "test_network:following" (
	"userId" integer NOT NULL,
	"id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("userId","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:like" (
	"userId" serial NOT NULL,
	"postId" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "test_network:like_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senderId" integer NOT NULL,
	"textContent" text,
	"imageUrl" varchar(256),
	"chatId" uuid NOT NULL,
	"receiverId" integer NOT NULL,
	"read" boolean DEFAULT false,
	"messageType" "messageType" DEFAULT 'text',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senderId" serial NOT NULL,
	"receiverId" serial NOT NULL,
	"itemId" uuid,
	"textContent" text,
	"read" boolean DEFAULT false,
	"type" "type" NOT NULL,
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
CREATE TABLE IF NOT EXISTS "test_network:profile" (
	"userId" integer PRIMARY KEY NOT NULL,
	"ProfilePic" varchar(256),
	"backgroundPic" varchar(256),
	"text" text,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:users_test" (
	"id" serial PRIMARY KEY NOT NULL,
	"providerId" varchar(256),
	"displayName" text,
	"password" text,
	"username" varchar(256),
	"email" text,
	"description" text,
	"provider" text DEFAULT 'local',
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:users_test_id_unique" UNIQUE("id"),
	CONSTRAINT "test_network:users_test_username_unique" UNIQUE("username"),
	CONSTRAINT "provider and username" UNIQUE("username","provider"),
	CONSTRAINT "unique username" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:chats" ADD CONSTRAINT "test_network:chats_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:chats" ADD CONSTRAINT "test_network:chats_receiverId_test_network:users_test_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:following" ADD CONSTRAINT "test_network:following_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:following" ADD CONSTRAINT "test_network:following_id_test_network:users_test_id_fk" FOREIGN KEY ("id") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_senderId_test_network:users_test_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_chatId_test_network:chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."test_network:chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_receiverId_test_network:users_test_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:notifications" ADD CONSTRAINT "test_network:notifications_senderId_test_network:users_test_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:notifications" ADD CONSTRAINT "test_network:notifications_receiverId_test_network:users_test_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:posts" ADD CONSTRAINT "test_network:posts_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:postsPicture" ADD CONSTRAINT "test_network:postsPicture_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:profile" ADD CONSTRAINT "test_network:profile_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
