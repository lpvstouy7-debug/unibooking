-- CreateEnum
CREATE TYPE "HotelPropertyType" AS ENUM ('HOTEL', 'RESORT', 'VILLA', 'GUESTHOUSE');

-- CreateEnum
CREATE TYPE "SeatClass" AS ENUM ('ECONOMY', 'BUSINESS', 'FIRST');

-- CreateEnum
CREATE TYPE "TourDifficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'VAN', 'PICKUP', 'MOTORBIKE');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceType" ADD VALUE 'BUS';
ALTER TYPE "ServiceType" ADD VALUE 'TOUR';
ALTER TYPE "ServiceType" ADD VALUE 'CAR_RENTAL';

-- CreateTable
CREATE TABLE "HotelDetails" (
    "serviceId" TEXT NOT NULL,
    "starRating" SMALLINT NOT NULL,
    "propertyType" "HotelPropertyType" NOT NULL,
    "amenities" TEXT[],

    CONSTRAINT "HotelDetails_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "TransportDetails" (
    "serviceId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "seatClass" "SeatClass" NOT NULL,

    CONSTRAINT "TransportDetails_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "TourDetails" (
    "serviceId" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "TourDifficulty" NOT NULL,
    "minGroupSize" INTEGER NOT NULL,
    "maxGroupSize" INTEGER NOT NULL,

    CONSTRAINT "TourDetails_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "CarRentalDetails" (
    "serviceId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "seatingCapacity" INTEGER NOT NULL,

    CONSTRAINT "CarRentalDetails_pkey" PRIMARY KEY ("serviceId")
);

-- CreateIndex
CREATE INDEX "HotelDetails_starRating_idx" ON "HotelDetails"("starRating");

-- CreateIndex
CREATE INDEX "HotelDetails_propertyType_idx" ON "HotelDetails"("propertyType");

-- CreateIndex
CREATE INDEX "TransportDetails_origin_destination_idx" ON "TransportDetails"("origin", "destination");

-- CreateIndex
CREATE INDEX "TransportDetails_seatClass_idx" ON "TransportDetails"("seatClass");

-- CreateIndex
CREATE INDEX "TourDetails_category_idx" ON "TourDetails"("category");

-- CreateIndex
CREATE INDEX "TourDetails_difficulty_idx" ON "TourDetails"("difficulty");

-- CreateIndex
CREATE INDEX "CarRentalDetails_vehicleType_idx" ON "CarRentalDetails"("vehicleType");

-- AddForeignKey
ALTER TABLE "HotelDetails" ADD CONSTRAINT "HotelDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportDetails" ADD CONSTRAINT "TransportDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourDetails" ADD CONSTRAINT "TourDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRentalDetails" ADD CONSTRAINT "CarRentalDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
