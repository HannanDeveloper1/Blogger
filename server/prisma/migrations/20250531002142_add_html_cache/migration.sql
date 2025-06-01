-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "htmlCache" TEXT;

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");
