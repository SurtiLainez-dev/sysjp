/*
  Warnings:

  - Changed the type of `start_period` on the `payrolls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_period` on the `payrolls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `payrolls` DROP COLUMN `start_period`,
    ADD COLUMN `start_period` INTEGER NOT NULL,
    DROP COLUMN `end_period`,
    ADD COLUMN `end_period` INTEGER NOT NULL;
