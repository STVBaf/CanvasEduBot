-- AlterTable
ALTER TABLE `FileMeta` ADD COLUMN `content` TEXT NULL,
    ADD COLUMN `fileType` VARCHAR(191) NULL,
    ADD COLUMN `summary` TEXT NULL,
    MODIFY `downloadUrl` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `canvasId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `courseCode` VARCHAR(191) NULL,

    UNIQUE INDEX `Course_canvasId_key`(`canvasId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` VARCHAR(191) NOT NULL,
    `canvasId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `dueAt` DATETIME(3) NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Assignment_canvasId_key`(`canvasId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FileMeta` ADD CONSTRAINT `FileMeta_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
