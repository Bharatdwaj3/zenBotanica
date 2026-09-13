/*
  Warnings:

  - You are about to drop the `penalty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "penalty";

-- DropTable
DROP TABLE "session";

-- CreateTable
CREATE TABLE "loan" (
    "id" SERIAL NOT NULL,
    "specimenId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fine" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedBy" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "waived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loanId" INTEGER,

    CONSTRAINT "fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fine_loanId_key" ON "fine"("loanId");
