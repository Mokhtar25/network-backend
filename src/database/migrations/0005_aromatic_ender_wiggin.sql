ALTER TABLE "test_network:like" DROP CONSTRAINT "test_network:like_postId_userId_pk";--> statement-breakpoint
ALTER TABLE "test_network:like" ADD CONSTRAINT "likeId" PRIMARY KEY("postId","userId");