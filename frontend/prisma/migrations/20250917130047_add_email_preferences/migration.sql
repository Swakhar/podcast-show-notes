/*
  Warnings:

  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Membership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Membership" ("createdAt", "id", "role", "teamId", "userId") SELECT "createdAt", "id", "role", "teamId", "userId" FROM "Membership";
DROP TABLE "Membership";
ALTER TABLE "new_Membership" RENAME TO "Membership";
CREATE UNIQUE INDEX "Membership_teamId_userId_key" ON "Membership"("teamId", "userId");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "description", "id", "name", "ownerId", "updatedAt") SELECT "createdAt", "description", "id", "name", "ownerId", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "priceId" TEXT,
    "subscriptionStatus" TEXT,
    "monthlyMinutesLimit" INTEGER NOT NULL DEFAULT 30,
    "monthlyMinutesUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailRssNewContent" BOOLEAN NOT NULL DEFAULT true,
    "emailManualJobs" BOOLEAN NOT NULL DEFAULT true,
    "emailWeeklyDigest" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "monthlyMinutesLimit", "monthlyMinutesUsed", "monthlyResetAt", "name", "password", "plan", "priceId", "resetToken", "resetTokenExpiry", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "monthlyMinutesLimit", "monthlyMinutesUsed", "monthlyResetAt", "name", "password", "plan", "priceId", "resetToken", "resetTokenExpiry", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
