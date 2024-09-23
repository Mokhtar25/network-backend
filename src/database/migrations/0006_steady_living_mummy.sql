ALTER TABLE "test_network:notifications" RENAME COLUMN "reciverId" TO "receiverId";--> statement-breakpoint
ALTER TABLE "test_network:notifications" DROP CONSTRAINT "test_network:notifications_reciverId_test_network:users_test_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:notifications" ADD CONSTRAINT "test_network:notifications_receiverId_test_network:users_test_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
