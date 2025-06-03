-- CreateEnum
CREATE TYPE "accountType" AS ENUM ('normal', 'oauth');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "method" "accountType" NOT NULL DEFAULT 'normal';
