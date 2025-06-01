/*
  Warnings:

  - Added the required column `visibility` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "visibility" "Visibility" NOT NULL;
