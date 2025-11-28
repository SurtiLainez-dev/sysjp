/*
  Warnings:

  - Added the required column `office_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `office_id` INTEGER NOT NULL,
    ADD COLUMN `type` ENUM('MANUAL', 'PURCHASE', 'PAYROLL', 'SALES', 'CARD', 'BANK_TRANSFER') NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX `transactions_office_id_idx` ON `transactions`(`office_id`);

-- CreateIndex
CREATE INDEX `transactions_type_idx` ON `transactions`(`type`);

-- CreateIndex
CREATE INDEX `transactions_date_idx` ON `transactions`(`date`);

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_office_id_fkey` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
