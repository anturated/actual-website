-- AlterTable
ALTER TABLE "User" ADD COLUMN     "perms" TEXT[] DEFAULT ARRAY[]::TEXT[];
