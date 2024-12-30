/*
  Warnings:

  - You are about to alter the column `content` on the `Tweet` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(280)`.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Tweet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(280);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "authType" VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE "TwitterAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twitterId" VARCHAR(30) NOT NULL,
    "username" VARCHAR(15) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "profilePictureUrl" VARCHAR(512) NOT NULL,
    "firstVerifiedAt" TIMESTAMP(3) NOT NULL,
    "latestVerifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" CHAR(42) NOT NULL,
    "walletType" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_userId_key" ON "TwitterAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_twitterId_key" ON "TwitterAccount"("twitterId");

-- CreateIndex
CREATE INDEX "TwitterAccount_twitterId_idx" ON "TwitterAccount"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Tweet_userId_idx" ON "Tweet"("userId");

-- AddForeignKey
ALTER TABLE "TwitterAccount" ADD CONSTRAINT "TwitterAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
