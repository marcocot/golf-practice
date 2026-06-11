-- CreateTable
CREATE TABLE "QuizResult" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "quizId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizResult_userId_updatedAt_idx" ON "QuizResult"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
