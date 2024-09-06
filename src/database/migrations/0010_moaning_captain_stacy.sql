ALTER TABLE "test_network:like" DROP CONSTRAINT "likeId";--> statement-breakpoint
ALTER TABLE "test_network:like" ADD CONSTRAINT "test_network:like_postId_userId_pk" PRIMARY KEY("postId","userId");