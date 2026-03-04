/*
  Warnings:

  - The `ano_entrada` column on the `estoque_registro` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `estoque_registro` DROP COLUMN `ano_entrada`,
    ADD COLUMN `ano_entrada` INTEGER NULL;
