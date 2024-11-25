-- CreateEnum
CREATE TYPE "Status" AS ENUM ('initial', 'generating', 'processing', 'done', 'fail');

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "aiId" TEXT,
    "status" "Status" NOT NULL,
    "url" TEXT,
    "urlSized" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);
