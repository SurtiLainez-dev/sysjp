/*
  Warnings:

  - A unique constraint covering the columns `[cod]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cod` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `cod` VARCHAR(191) NOT NULL,
    ADD COLUMN `ref_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `transactions_cod_key` ON `transactions`(`cod`);
