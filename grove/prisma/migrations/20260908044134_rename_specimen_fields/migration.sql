/*
  Warnings:

  - The values [FICTION,NON_FICTION,FANTASY,SCIENCE,SCIENCE_FICTION,MYSTERY,ROMANCE,HORROR,HISTORY,BIOGRAPHY,POETRY,DRAMA,SELF_HELP,TECHNOLOGY,PHILOSOPHY,CHILDREN] on the enum `Genre` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `author` on the `specimen` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `specimen` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `specimen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessionNumber]` on the table `specimen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessionNumber` to the `specimen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cultivator` to the `specimen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nursery` to the `specimen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Genre_new" AS ENUM ('FLORA', 'FAUNA', 'FUNGUS', 'MINERAL', 'ARTIFACT', 'HERB', 'SEED', 'UNKNOWN');
ALTER TABLE "specimen" ALTER COLUMN "genre" TYPE "Genre_new"[] USING ("genre"::text::"Genre_new"[]);
ALTER TYPE "Genre" RENAME TO "Genre_old";
ALTER TYPE "Genre_new" RENAME TO "Genre";
DROP TYPE "public"."Genre_old";
COMMIT;

-- DropIndex
DROP INDEX "specimen_isbn_key";

-- AlterTable
ALTER TABLE "specimen" DROP COLUMN "author",
DROP COLUMN "isbn",
DROP COLUMN "publisher",
ADD COLUMN     "accessionNumber" TEXT NOT NULL,
ADD COLUMN     "cultivator" TEXT NOT NULL,
ADD COLUMN     "nursery" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "specimen_accessionNumber_key" ON "specimen"("accessionNumber");
