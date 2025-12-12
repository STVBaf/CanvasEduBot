-- DropForeignKey
ALTER TABLE `FileMeta` DROP FOREIGN KEY `FileMeta_userId_fkey`;

-- AlterTable
ALTER TABLE `FileMeta` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `FileMeta` ADD CONSTRAINT `FileMeta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
