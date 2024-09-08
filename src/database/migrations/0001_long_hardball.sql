ALTER TABLE "test_network:message" DROP CONSTRAINT "test_network:message_chatId_test_network:chats_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:following" ALTER COLUMN "userId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "test_network:following" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "test_network:message" ALTER COLUMN "chatId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "test_network:notifications" ALTER COLUMN "itemId" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_chatId_test_network:chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."test_network:chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


