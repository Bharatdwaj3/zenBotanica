-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'tourist';
ALTER TYPE "Role" ADD VALUE 'farmer';
ALTER TYPE "Role" ADD VALUE 'merchant';

-- CreateTable
CREATE TABLE "tourist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "Fname" TEXT,
    "Lname" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tourist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "Fname" TEXT NOT NULL,
    "Lname" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "Fname" TEXT NOT NULL,
    "Lname" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tourist_email_key" ON "tourist"("email");
CREATE UNIQUE INDEX "tourist_userId_key" ON "tourist"("userId");
CREATE UNIQUE INDEX "farmer_email_key" ON "farmer"("email");
CREATE UNIQUE INDEX "farmer_userId_key" ON "farmer"("userId");
CREATE UNIQUE INDEX "merchant_email_key" ON "merchant"("email");
CREATE UNIQUE INDEX "merchant_userId_key" ON "merchant"("userId");

-- AddForeignKey
ALTER TABLE "tourist" ADD CONSTRAINT "tourist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "farmer" ADD CONSTRAINT "farmer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "merchant" ADD CONSTRAINT "merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
