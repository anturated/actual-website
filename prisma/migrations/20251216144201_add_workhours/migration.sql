-- CreateTable
CREATE TABLE "WorkHours" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seconds" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkHours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkHours" ADD CONSTRAINT "WorkHours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
