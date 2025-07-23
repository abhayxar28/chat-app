/*
  Warnings:

  - You are about to drop the column `vote` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "vote",
ADD COLUMN     "like" INTEGER DEFAULT 0;
