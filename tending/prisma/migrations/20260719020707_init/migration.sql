-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);
