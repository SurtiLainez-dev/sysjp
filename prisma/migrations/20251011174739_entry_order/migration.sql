-- CreateTable
CREATE TABLE `entry_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `supplier_id` INTEGER NULL,
    `branch_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_amount` DECIMAL(12, 2) NULL,
    `disccount` DECIMAL(12, 2) NULL,
    `notes` VARCHAR(191) NULL,
    `is_invoiced` BOOLEAN NOT NULL DEFAULT false,
    `is_posted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entry_orders_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_order_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_order_id` INTEGER NOT NULL,
    `article_id` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `unit_cost` DECIMAL(12, 2) NULL,
    `subtotal` DECIMAL(12, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER NOT NULL,
    `article_id` INTEGER NOT NULL,
    `stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `article_stocks_branch_id_article_id_key`(`branch_id`, `article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entry_orders` ADD CONSTRAINT `entry_orders_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_orders` ADD CONSTRAINT `entry_orders_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_order_details` ADD CONSTRAINT `entry_order_details_entry_order_id_fkey` FOREIGN KEY (`entry_order_id`) REFERENCES `entry_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_order_details` ADD CONSTRAINT `entry_order_details_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_stocks` ADD CONSTRAINT `article_stocks_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_stocks` ADD CONSTRAINT `article_stocks_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
