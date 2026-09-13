/*
  Warnings:

  - You are about to drop the `apprentice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `botanist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `caretaker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "apprentice" DROP CONSTRAINT "apprentice_userId_fkey";

-- DropForeignKey
ALTER TABLE "botanist" DROP CONSTRAINT "botanist_userId_fkey";

-- DropForeignKey
ALTER TABLE "caretaker" DROP CONSTRAINT "caretaker_userId_fkey";

-- DropTable
DROP TABLE "apprentice";

-- DropTable
DROP TABLE "botanist";

-- DropTable
DROP TABLE "caretaker";

-- DropTable
DROP TABLE "user";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Subject";

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "touristId" INTEGER,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation" (
    "id" SERIAL NOT NULL,
    "touristId" INTEGER NOT NULL,
    "specimenId" INTEGER,
    "type" TEXT NOT NULL,
    "fineAmount" INTEGER NOT NULL,
    "reportedBy" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_request" (
    "id" SERIAL NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_request_pkey" PRIMARY KEY ("id")
);
