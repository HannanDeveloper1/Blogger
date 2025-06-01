/*
  Warnings:

  - The `location` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `platform` on the `social_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('x', 'github', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'other');

-- AlterTable
ALTER TABLE "social_links" DROP COLUMN "platform",
ADD COLUMN     "platform" "SocialPlatform" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
DROP COLUMN "location",
ADD COLUMN     "location" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "social_links_userId_platform_key" ON "social_links"("userId", "platform");
