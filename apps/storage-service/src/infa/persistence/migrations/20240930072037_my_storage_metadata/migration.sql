/*
  Warnings:

  - Added the required column `metadata` to the `my_storage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "my_storage" ADD COLUMN     "metadata" JSONB NOT NULL;
