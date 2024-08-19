ALTER TABLE "test_network:users_test" ADD COLUMN "providerId" varchar(256);--> statement-breakpoint
ALTER TABLE "test_network:users_test" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "test_network:users_test" ADD CONSTRAINT "test_network:users_test_id_unique" UNIQUE("id");