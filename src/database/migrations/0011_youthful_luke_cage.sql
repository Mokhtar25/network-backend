ALTER TABLE "test_network:message" DROP CONSTRAINT "test_network:message_id_unique";--> statement-breakpoint
ALTER TABLE "test_network:message" DROP CONSTRAINT "test_network:message_chatId_test_network:chats_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:message" ALTER COLUMN "chatId" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "chatId" FOREIGN KEY ("chatId") REFERENCES "public"."test_network:chats"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
