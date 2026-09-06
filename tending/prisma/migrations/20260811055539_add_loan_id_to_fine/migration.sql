/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `penalty` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "penalty" ADD COLUMN     "sessionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "penalty_sessionId_key" ON "penalty"("sessionId");
