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
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certifiedBy" INTEGER,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
