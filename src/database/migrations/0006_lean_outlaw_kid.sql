CREATE TABLE IF NOT EXISTS "test_network:posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" serial NOT NULL,
	"textContent" text,
	"username" varchar(256)[],
	"likesCount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:posts_id_unique" UNIQUE("id"),
	CONSTRAINT "test_network:posts_username_unique" UNIQUE("username")
);
