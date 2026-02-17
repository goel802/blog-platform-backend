/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `_CategoryToPost` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToPost" DROP CONSTRAINT "_CategoryToPost_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToPost" DROP CONSTRAINT "_CategoryToPost_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
ADD COLUMN     "categoryId" TEXT;

-- DropTable
DROP TABLE "_CategoryToPost";

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
