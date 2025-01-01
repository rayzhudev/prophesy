-- DropIndex
DROP INDEX IF EXISTS "Wallet_userId_key";

-- AlterTable
ALTER TABLE "TwitterAccount" ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastMetricsFetch" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "listedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mediaCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tweetCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "firstVerifiedAt" DROP NOT NULL,
ALTER COLUMN "latestVerifiedAt" DROP NOT NULL;

-- AlterTable: Add walletClientType as nullable first
ALTER TABLE "Wallet" ADD COLUMN "walletClientType" VARCHAR(20);

-- Copy existing data
UPDATE "Wallet" SET "walletClientType" = "walletType";

-- Now make walletType nullable
ALTER TABLE "Wallet" ALTER COLUMN "walletType" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");
