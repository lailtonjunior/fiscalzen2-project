/*
  Warnings:

  - The primary key for the `_NotaTags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_NotaTags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_NotaTags" DROP CONSTRAINT "_NotaTags_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_NotaTags_AB_unique" ON "_NotaTags"("A", "B");
