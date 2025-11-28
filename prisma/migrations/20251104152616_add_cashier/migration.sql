-- DropForeignKey
ALTER TABLE `payment_methods` DROP FOREIGN KEY `payment_methods_account_id_fkey`;

-- AlterTable
ALTER TABLE `payment_methods` MODIFY `account_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `cashiers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `office_id` INTEGER NOT NULL,
    `account_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cashiers_user_id_idx`(`user_id`),
    INDEX `cashiers_office_id_idx`(`office_id`),
    INDEX `cashiers_account_id_idx`(`account_id`),
    INDEX `cashiers_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashiers` ADD CONSTRAINT `cashiers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashiers` ADD CONSTRAINT `cashiers_office_id_fkey` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashiers` ADD CONSTRAINT `cashiers_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
