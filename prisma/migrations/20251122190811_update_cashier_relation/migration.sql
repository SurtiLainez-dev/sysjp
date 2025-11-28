/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `cashiers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `cashiers_user_id_key` ON `cashiers`(`user_id`);
