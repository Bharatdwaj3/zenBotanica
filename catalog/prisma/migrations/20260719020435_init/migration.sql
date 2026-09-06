-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('FICTION', 'NON_FICTION', 'FANTASY', 'SCIENCE', 'SCIENCE_FICTION', 'MYSTERY', 'ROMANCE', 'HORROR', 'HISTORY', 'BIOGRAPHY', 'POETRY', 'DRAMA', 'SELF_HELP', 'TECHNOLOGY', 'PHILOSOPHY', 'CHILDREN');

-- CreateTable
CREATE TABLE "book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "genre" "Genre"[],
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "coverUrl" TEXT,
    "addedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_isbn_key" ON "book"("isbn");
