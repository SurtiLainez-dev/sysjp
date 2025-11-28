-- CreateTable
CREATE TABLE `receipts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cashier_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `customer_id` INTEGER NULL,
    `work_order_id` INTEGER NULL,
    `payment_method_id` INTEGER NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tax_total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discount_total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `status` ENUM('PAID', 'VOID') NOT NULL DEFAULT 'PAID',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `voided_at` DATETIME(3) NULL,

    INDEX `receipts_cashier_id_idx`(`cashier_id`),
    INDEX `receipts_user_id_idx`(`user_id`),
    INDEX `receipts_customer_id_idx`(`customer_id`),
    INDEX `receipts_work_order_id_idx`(`work_order_id`),
    INDEX `receipts_payment_method_id_idx`(`payment_method_id`),
    INDEX `receipts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipt_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receipt_id` INTEGER NOT NULL,
    `article_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `qty` DECIMAL(12, 3) NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(12, 4) NOT NULL,
    `tax_amount` DECIMAL(12, 4) NOT NULL DEFAULT 0,
    `line_subtotal` DECIMAL(12, 2) NOT NULL,
    `line_total` DECIMAL(12, 2) NOT NULL,

    INDEX `receipt_items_receipt_id_idx`(`receipt_id`),
    INDEX `receipt_items_article_id_idx`(`article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipt_taxes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receipt_id` INTEGER NOT NULL,
    `tax_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(8, 6) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    INDEX `receipt_taxes_tax_id_idx`(`tax_id`),
    UNIQUE INDEX `receipt_taxes_receipt_id_tax_id_key`(`receipt_id`, `tax_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cashier_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cashier_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('ENTRY', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `receipt_id` INTEGER NULL,
    `payment_method_id` INTEGER NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cashier_transactions_cashier_id_idx`(`cashier_id`),
    INDEX `cashier_transactions_user_id_idx`(`user_id`),
    INDEX `cashier_transactions_receipt_id_idx`(`receipt_id`),
    INDEX `cashier_transactions_payment_method_id_idx`(`payment_method_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_cashier_id_fkey` FOREIGN KEY (`cashier_id`) REFERENCES `cashiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_work_order_id_fkey` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt_items` ADD CONSTRAINT `receipt_items_receipt_id_fkey` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt_items` ADD CONSTRAINT `receipt_items_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt_taxes` ADD CONSTRAINT `receipt_taxes_receipt_id_fkey` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt_taxes` ADD CONSTRAINT `receipt_taxes_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `taxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashier_transactions` ADD CONSTRAINT `cashier_transactions_cashier_id_fkey` FOREIGN KEY (`cashier_id`) REFERENCES `cashiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashier_transactions` ADD CONSTRAINT `cashier_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashier_transactions` ADD CONSTRAINT `cashier_transactions_receipt_id_fkey` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cashier_transactions` ADD CONSTRAINT `cashier_transactions_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
