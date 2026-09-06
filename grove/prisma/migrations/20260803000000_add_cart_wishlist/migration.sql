-- CreateTable
CREATE TABLE "cart_item" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "specimenId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_item" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "specimenId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_userId_specimenId_key" ON "cart_item"("userId", "specimenId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_userId_specimenId_key" ON "wishlist_item"("userId", "specimenId");

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

