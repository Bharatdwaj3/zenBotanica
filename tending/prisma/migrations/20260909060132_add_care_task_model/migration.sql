-- CreateTable
CREATE TABLE "care_task" (
    "id" SERIAL NOT NULL,
    "specimenId" INTEGER NOT NULL,
    "caretakerId" INTEGER NOT NULL,
    "taskType" TEXT NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "lastCompletedAt" TIMESTAMP(3),

    CONSTRAINT "care_task_pkey" PRIMARY KEY ("id")
);
