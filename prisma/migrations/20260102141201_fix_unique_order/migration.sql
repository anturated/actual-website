/*
  Warnings:

  - A unique constraint covering the columns `[columnId,order]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,order]` on the table `Column` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Card_order_key";

-- DropIndex
DROP INDEX "public"."Column_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "Card_columnId_order_key" ON "Card"("columnId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Column_projectId_order_key" ON "Column"("projectId", "order");
