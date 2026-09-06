/*
  Warnings:

  - A unique constraint covering the columns `[loanId]` on the table `fine` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "fine" ADD COLUMN     "loanId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "fine_loanId_key" ON "fine"("loanId");
