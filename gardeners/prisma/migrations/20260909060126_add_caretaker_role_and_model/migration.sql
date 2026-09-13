/*
  Warnings:

  - The values [admin,master] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `master` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('curator', 'botanist', 'apprentice', 'caretaker');
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Subject" ADD VALUE 'Botany';
ALTER TYPE "Subject" ADD VALUE 'Ecology';
ALTER TYPE "Subject" ADD VALUE 'Horticulture';
ALTER TYPE "Subject" ADD VALUE 'Mycology';
ALTER TYPE "Subject" ADD VALUE 'Geology';

-- DropForeignKey
ALTER TABLE "master" DROP CONSTRAINT "master_userId_fkey";

-- DropTable
DROP TABLE "master";

-- CreateTable
CREATE TABLE "botanist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "Fname" TEXT NOT NULL,
    "Lname" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "Expertise" "Subject" NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "botanist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caretaker" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "Fname" TEXT NOT NULL,
    "Lname" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "caretaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "botanist_email_key" ON "botanist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "botanist_userId_key" ON "botanist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "caretaker_email_key" ON "caretaker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "caretaker_userId_key" ON "caretaker"("userId");

-- AddForeignKey
ALTER TABLE "botanist" ADD CONSTRAINT "botanist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caretaker" ADD CONSTRAINT "caretaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
