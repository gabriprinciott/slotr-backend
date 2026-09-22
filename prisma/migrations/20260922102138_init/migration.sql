-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time_slot" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_date_time_slot_key" ON "Booking"("date", "time_slot");
