ALTER TABLE "test_network:comment" DROP CONSTRAINT "test_network:comment_userId_test_network:users_test_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:comment" DROP CONSTRAINT "test_network:comment_postId_test_network:posts_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:like" DROP CONSTRAINT "test_network:like_userId_test_network:users_test_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:like" DROP CONSTRAINT "test_network:like_postId_test_network:posts_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:posts" DROP CONSTRAINT "test_network:posts_userId_test_network:users_test_id_fk";
--> statement-breakpoint
ALTER TABLE "test_network:postsPicture" DROP CONSTRAINT "test_network:postsPicture_postId_test_network:posts_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:comment" ADD CONSTRAINT "test_network:comment_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:posts" ADD CONSTRAINT "test_network:posts_userId_test_network:users_test_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."test_network:users_test"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_network:postsPicture" ADD CONSTRAINT "test_network:postsPicture_postId_test_network:posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."test_network:posts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
