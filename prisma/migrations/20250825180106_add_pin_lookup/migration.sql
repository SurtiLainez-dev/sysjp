/*
  Warnings:

  - A unique constraint covering the columns `[pin_lookup]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pin_lookup` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `pin_lookup` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_pin_lookup_key` ON `users`(`pin_lookup`);
