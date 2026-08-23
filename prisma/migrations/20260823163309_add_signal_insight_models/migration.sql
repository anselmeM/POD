-- CreateTable
CREATE TABLE "SignalEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "variantId" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SignalEvent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "recommendation" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIInsight_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SignalEvent_experimentId_idx" ON "SignalEvent"("experimentId");

-- CreateIndex
CREATE INDEX "SignalEvent_eventType_idx" ON "SignalEvent"("eventType");

-- CreateIndex
CREATE INDEX "SignalEvent_timestamp_idx" ON "SignalEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AIInsight_experimentId_idx" ON "AIInsight"("experimentId");

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");
