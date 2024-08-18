CREATE TABLE IF NOT EXISTS "test_network:users_test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"password" text,
	"username" varchar(256) NOT NULL,
	"email" text,
	"provider" text DEFAULT 'local',
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:users_test_username_unique" UNIQUE("username")
);
