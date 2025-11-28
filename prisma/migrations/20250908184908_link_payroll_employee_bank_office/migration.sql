-- CreateTable
CREATE TABLE `type_payrolls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `effect` ENUM('ADD', 'SUBTRACT') NOT NULL DEFAULT 'ADD',
    `default_debit_account_id` INTEGER NULL,
    `default_credit_account_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payrolls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `start_period` DATETIME(3) NOT NULL,
    `end_period` DATETIME(3) NOT NULL,
    `gross_total` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `deductions_total` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `net_total` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `bank_account_id` INTEGER NULL,
    `type_pay` ENUM('CASH', 'CARD', 'CHECK', 'ZELLE', 'TRANSFER') NOT NULL DEFAULT 'CASH',
    `office_id` INTEGER NOT NULL,
    `transaction_id` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payrolls_employee_id_idx`(`employee_id`),
    INDEX `payrolls_office_id_idx`(`office_id`),
    INDEX `payrolls_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payroll_id` INTEGER NOT NULL,
    `type_payroll_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `qty` DECIMAL(18, 4) NOT NULL DEFAULT 1,
    `rate` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `amount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payroll_items_payroll_id_idx`(`payroll_id`),
    INDEX `payroll_items_type_payroll_id_idx`(`type_payroll_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `type_payrolls` ADD CONSTRAINT `type_payrolls_default_debit_account_id_fkey` FOREIGN KEY (`default_debit_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `type_payrolls` ADD CONSTRAINT `type_payrolls_default_credit_account_id_fkey` FOREIGN KEY (`default_credit_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_office_id_fkey` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_items` ADD CONSTRAINT `payroll_items_payroll_id_fkey` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_items` ADD CONSTRAINT `payroll_items_type_payroll_id_fkey` FOREIGN KEY (`type_payroll_id`) REFERENCES `type_payrolls`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
