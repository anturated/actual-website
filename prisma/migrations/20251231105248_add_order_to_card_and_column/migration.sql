/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `Column` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Card_order_key" ON "Card"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Column_order_key" ON "Column"("order");
