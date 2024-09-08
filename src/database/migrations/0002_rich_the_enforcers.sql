ALTER TABLE "test_network:profile" ALTER COLUMN "userId" SET DATA TYPE integer;


ALTER TABLE "test_network:notifications"
ALTER COLUMN "type" TYPE "public"."type"
USING "type"::text::"public"."type";
DROP TYPE "public"."type_old";

