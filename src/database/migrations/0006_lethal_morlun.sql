CREATE TABLE IF NOT EXISTS "test_network:chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" serial NOT NULL,
	"reciverId" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:chats_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:following" (
	"userId" serial NOT NULL,
	"id" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("userId","id")
);

DO $$ BEGIN
 CREATE TYPE "public"."messageType" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senderId" serial NOT NULL,
	"textContent" text,
	"chatId" uuid NOT NULL,
	"reciverId" serial NOT NULL,
	"read" boolean DEFAULT false,
	"messageType" "messageType" DEFAULT 'text',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:message_id_unique" UNIQUE("id")
);


DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('commnet', 'like', 'request', 'acceptRequest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" serial NOT NULL,
	"itemId" uuid NOT NULL,
	"textContent" text,
	"read" boolean DEFAULT false,
	"type" "type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_network:profile" (
	"userId" serial NOT NULL,
	"ProfilePic" varchar(256),
	"backgroundPic" varchar(256),
	"text" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:chats" ADD CONSTRAINT "test_network:chats_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:chats" ADD CONSTRAINT "test_network:chats_reciverId_test_network:users_test_id_fk" FOREIGN KEY ("reciverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_reciverId_test_network:users_test_id_fk" FOREIGN KEY ("reciverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:notifications" ADD CONSTRAINT "test_network:notifications_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:profile" ADD CONSTRAINT "test_network:profile_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "test_network:users_test" ADD CONSTRAINT "provider and username" UNIQUE("username","provider");
