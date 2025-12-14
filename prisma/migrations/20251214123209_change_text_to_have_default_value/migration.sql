/*
  Warnings:

  - Made the column `text` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "text" SET NOT NULL,
ALTER COLUMN "text" SET DEFAULT '';
