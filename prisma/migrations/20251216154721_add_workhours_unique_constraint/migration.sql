/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `WorkHours` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkHours_userId_date_key" ON "WorkHours"("userId", "date");
