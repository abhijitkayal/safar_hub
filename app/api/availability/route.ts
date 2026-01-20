import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Booking from "@/models/Booking";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";

type ServiceType = "stay" | "tour" | "adventure" | "vehicle";

const SERVICE_CONFIG: Record<
  ServiceType,
  { field: "stayId" | "tourId" | "adventureId" | "vehicleRentalId"; startField: string; endField: string }
> = {
  stay: { field: "stayId", startField: "checkIn", endField: "checkOut" },
  tour: { field: "tourId", startField: "startDate", endField: "endDate" },
  adventure: { field: "adventureId", startField: "startDate", endField: "endDate" },
  vehicle: { field: "vehicleRentalId", startField: "pickupDate", endField: "dropoffDate" },
};

const isValidDate = (value: string | null): value is string => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType") as ServiceType | null;
    const id = searchParams.get("id");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!serviceType || !SERVICE_CONFIG[serviceType]) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing serviceType" },
        { status: 400 }
      );
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const hasRange = isValidDate(startParam) && isValidDate(endParam);
    if (hasRange && new Date(startParam!) >= new Date(endParam!)) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const { field, startField, endField } = SERVICE_CONFIG[serviceType];

    let optionCount = 0;
    const optionKeys: string[] = [];

    switch (serviceType) {
      case "stay": {
        const stay = await Stay.findById(id).select("rooms._id rooms.name").lean();
        if (!stay || Array.isArray(stay)) {
          return NextResponse.json({ success: false, message: "Stay not found" }, { status: 404 });
        }
        if (stay.rooms && Array.isArray(stay.rooms)) {
          stay.rooms.forEach((room: any) => {
            const key = room?._id?.toString() || room?.name;
            if (key) optionKeys.push(key);
          });
        }
        optionCount = optionKeys.length;
        break;
      }
      case "tour": {
        const tour = await Tour.findById(id).select("options._id options.name").lean();
        if (!tour || Array.isArray(tour)) {
          return NextResponse.json({ success: false, message: "Tour not found" }, { status: 404 });
        }
        if (tour.options && Array.isArray(tour.options)) {
          tour.options.forEach((option: any) => {
            const key = option?._id?.toString() || option?.name;
            if (key) optionKeys.push(key);
          });
        }
        optionCount = optionKeys.length;
        break;
      }
      case "adventure": {
        const adventure = await Adventure.findById(id).select("options._id options.name").lean();
        if (!adventure || Array.isArray(adventure)) {
          return NextResponse.json({ success: false, message: "Adventure not found" }, { status: 404 });
        }
        if (adventure.options && Array.isArray(adventure.options)) {
          adventure.options.forEach((option: any) => {
            const key = option?._id?.toString() || option?.name;
            if (key) optionKeys.push(key);
          });
        }
        optionCount = optionKeys.length;
        break;
      }
      case "vehicle": {
        const rental = await VehicleRental.findById(id).select("options._id options.model").lean();
        if (!rental || Array.isArray(rental)) {
          return NextResponse.json({ success: false, message: "Vehicle rental not found" }, { status: 404 });
        }
        if (rental.options && Array.isArray(rental.options)) {
          rental.options.forEach((option: any) => {
            const key = option?._id?.toString() || option?.model;
            if (key) optionKeys.push(key);
          });
        }
        optionCount = optionKeys.length;
        break;
      }
      default:
        optionCount = 0;
    }

    const filter: Record<string, any> = {
      status: { $ne: "cancelled" },
      [field]: new mongoose.Types.ObjectId(id),
    };

    const bookings = await Booking.find(
      filter,
      `${startField} ${endField} rooms.roomId rooms.roomName items.itemId items.itemName`
    )
      .sort({ [startField]: 1 })
      .lean();

    const bookedRanges = bookings
      .filter((booking) => booking[startField] && booking[endField])
      .map((booking) => ({
        start: (booking[startField] as Date).toISOString(),
        end: (booking[endField] as Date).toISOString(),
      }));

    let isAvailable = true;
    const availableOptionKeys: string[] = [];

    if (hasRange) {
      const requestedStart = new Date(startParam!);
      const requestedEnd = new Date(endParam!);

      const overlappingBookings = bookings.filter((booking) => {
        const rangeStart = booking[startField] ? new Date(booking[startField]) : null;
        const rangeEnd = booking[endField] ? new Date(booking[endField]) : null;
        if (!rangeStart || !rangeEnd) return false;
        return rangeStart < requestedEnd && rangeEnd > requestedStart;
      });

      const occupiedOptionKeys = new Set<string>();
      overlappingBookings.forEach((booking) => {
        if (serviceType === "stay") {
          booking.rooms?.forEach((room: any) => {
            const key = room.roomId ? room.roomId.toString() : room.roomName;
            if (key) occupiedOptionKeys.add(key);
          });
        } else {
          booking.items?.forEach((item: any) => {
            const key = item.itemId ? item.itemId.toString() : item.itemName;
            if (key) occupiedOptionKeys.add(key);
          });
        }
      });

      optionKeys.forEach((key) => {
        if (!occupiedOptionKeys.has(key)) {
          availableOptionKeys.push(key);
        }
      });

      if (optionKeys.length > 0) {
        isAvailable = availableOptionKeys.length > 0;
      } else {
        // No configured options; default to available if nothing booked yet.
        isAvailable = occupiedOptionKeys.size === 0;
      }
    } else {
      optionKeys.forEach((key) => availableOptionKeys.push(key));
    }

    return NextResponse.json({
      success: true,
      serviceType,
      id,
      isAvailable,
      bookedRanges,
      availableOptionKeys,
    });
  } catch (error: any) {
    console.error("Availability lookup failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load availability" },
      { status: 500 }
    );
  }
}


