CREATE TABLE IF NOT EXISTS "test_network:users_test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" varchar(256) NOT NULL,
	"email" text,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "test_network:users_test_username_unique" UNIQUE("username")
);
