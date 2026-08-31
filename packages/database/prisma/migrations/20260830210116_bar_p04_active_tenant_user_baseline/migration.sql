-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;
