/*
  Warnings:

  - You are about to drop the column `action` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `activity_logs` table. All the data in the column will be lost.
  - Added the required column `type` to the `activity_logs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cardId" TEXT,
    "columnId" TEXT,
    "boardId" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_activity_logs" ("createdAt", "description", "id", "userId") SELECT "createdAt", "description", "id", "userId" FROM "activity_logs";
DROP TABLE "activity_logs";
ALTER TABLE "new_activity_logs" RENAME TO "activity_logs";
CREATE TABLE "new_notification_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notification_templates_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "columns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notification_templates" ("columnId", "createdAt", "id", "isActive", "template", "updatedAt") SELECT "columnId", "createdAt", "id", "isActive", "template", "updatedAt" FROM "notification_templates";
DROP TABLE "notification_templates";
ALTER TABLE "new_notification_templates" RENAME TO "notification_templates";
CREATE UNIQUE INDEX "notification_templates_columnId_key" ON "notification_templates"("columnId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
