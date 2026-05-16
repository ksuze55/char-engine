-- AlterTable
ALTER TABLE "AiMessage" ADD COLUMN     "tokensUsed" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
