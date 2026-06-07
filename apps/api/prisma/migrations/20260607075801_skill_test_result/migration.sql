-- CreateTable
CREATE TABLE "SkillTestResult" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "testKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SkillTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillTestResult_userId_updatedAt_idx" ON "SkillTestResult"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "SkillTestResult" ADD CONSTRAINT "SkillTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
