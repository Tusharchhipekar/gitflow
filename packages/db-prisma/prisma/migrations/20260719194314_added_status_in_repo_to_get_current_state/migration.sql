-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('pending', 'fetching', 'planning', 'generating', 'ready', 'failed');

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "status" "IndexStatus" NOT NULL DEFAULT 'pending';
