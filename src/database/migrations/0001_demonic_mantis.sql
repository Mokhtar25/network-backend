ALTER TABLE "test_network:users_test" ADD COLUMN "displayName" text;--> statement-breakpoint
ALTER TABLE "test_network:users_test" DROP COLUMN IF EXISTS "name";