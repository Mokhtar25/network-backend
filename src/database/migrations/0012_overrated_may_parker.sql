ALTER TABLE "test_network:notifications" RENAME COLUMN "userId" TO "senderId";--> statement-breakpoint
ALTER TABLE "test_network:message" DROP CONSTRAINT "chatId";
--> statement-breakpoint
ALTER TABLE "test_network:notifications" DROP CONSTRAINT "test_network:notifications_userId_test_network:users_test_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:chats" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "test_network:message" DROP COLUMN "chatId";
ALTER TABLE "test_network:message" ADD COLUMN "chatId" uuid;
ALTER TABLE "test_network:notifications" ADD COLUMN "receiverId" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:message" ADD CONSTRAINT "test_network:message_chatId_test_network:chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."test_network:chats"("id") ON DELETE no action ON UPDATE no action;
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
