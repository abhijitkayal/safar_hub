import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";
import Booking from "@/models/Booking";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/middlewares/auth";
import { mailSender } from "@/lib/utils/mailSender";
import bookingUserTemplate from "@/lib/mail/templates/bookingUserTemplate";
import bookingVendorTemplate from "@/lib/mail/templates/bookingVendorTemplate";
import bookingAdminTemplate from "@/lib/mail/templates/bookingAdminTemplate";

function calculateNights(checkIn: Date, checkOut: Date) {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateDays(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      serviceType: rawServiceType,
      stayId,
      tourId,
      adventureId,
      vehicleRentalId,
      checkIn,
      checkOut,
      startDate,
      endDate,
      pickupDate,
      dropoffDate,
      rooms,
      items,
      guests,
      customer,
      currency = "INR",
      notes,
      source = "web",
      couponCode,
    } = body;

    if (!customer?.fullName || !customer?.email) {
      return NextResponse.json({ success: false, message: "Guest name and email are required" }, { status: 400 });
    }

    const serviceType =
      rawServiceType ||
      (stayId ? "stay" : tourId ? "tour" : adventureId ? "adventure" : vehicleRentalId ? "vehicle" : null);

    if (!serviceType) {
      return NextResponse.json({ success: false, message: "A valid service type or reference id is required" }, { status: 400 });
    }

    let bookingPayload: any = {
      serviceType,
      customerId: body.customerId ?? null,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
      },
      currency,
      fees: Number(body.fees ?? 0),
      status: "pending",
      paymentStatus: "unpaid",
      metadata: {
        source,
        notes,
      },
    };

    const parsedGuests = {
      adults: Number(guests?.adults ?? 1),
      children: Number(guests?.children ?? 0),
      infants: Number(guests?.infants ?? 0),
    };

    let subtotal = 0;
    let taxes = 0;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    const makeDateRangeText = (start: Date, end: Date) =>
      `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;

    const sendBookingEmails = async (booking: any, context: { start: Date; end: Date }) => {
      try {
        const vendor = await User.findById(booking.vendorId);
        const vendorName = vendor?.fullName || "Vendor";
        const vendorEmail = vendor?.email;

        const checkInOutText = makeDateRangeText(context.start, context.end);

        const emailTasks: Promise<unknown>[] = [];

        // User email
        emailTasks.push(
          mailSender(
            booking.customer.email,
            "Your SafarHub booking is confirmed",
            bookingUserTemplate({
              fullName: booking.customer.fullName,
              email: booking.customer.email,
              serviceType: booking.serviceType,
              referenceCode: booking._id.toString(),
              checkInOutText,
              totalAmount: booking.totalAmount,
              currency: booking.currency,
            })
          )
        );

        // Vendor email
        if (vendorEmail) {
          emailTasks.push(
            mailSender(
              vendorEmail,
              "New SafarHub booking received",
              bookingVendorTemplate({
                vendorName,
                vendorEmail,
                serviceType: booking.serviceType,
                referenceCode: booking._id.toString(),
                customerName: booking.customer.fullName,
                customerEmail: booking.customer.email,
                customerPhone: booking.customer.phone,
                checkInOutText,
                totalAmount: booking.totalAmount,
                currency: booking.currency,
              })
            )
          );
        }

        // Admin email
        if (ADMIN_EMAIL && vendorEmail) {
          emailTasks.push(
            mailSender(
              ADMIN_EMAIL,
              "SafarHub booking created",
              bookingAdminTemplate({
                serviceType: booking.serviceType,
                referenceCode: booking._id.toString(),
                customerName: booking.customer.fullName,
                customerEmail: booking.customer.email,
                vendorName,
                vendorEmail,
                totalAmount: booking.totalAmount,
                currency: booking.currency,
              })
            )
          );
        }

        await Promise.allSettled(emailTasks);
      } catch (emailError) {
        console.error("Booking email error:", emailError);
      }
    };

    if (serviceType === "stay") {
      if (!stayId || !mongoose.Types.ObjectId.isValid(stayId)) {
        return NextResponse.json({ success: false, message: "Invalid stay id" }, { status: 400 });
      }

      if (!Array.isArray(rooms) || rooms.length === 0) {
        return NextResponse.json({ success: false, message: "At least one room booking is required" }, { status: 400 });
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
        return NextResponse.json({ success: false, message: "Invalid check-in/out dates" }, { status: 400 });
      }

      const stay = await Stay.findById(stayId);
      if (!stay || !stay.isActive) {
        return NextResponse.json({ success: false, message: "Stay not found" }, { status: 404 });
      }

      const nights = calculateNights(checkInDate, checkOutDate);

      const overlappingBookings = await Booking.find(
        {
          status: { $ne: "cancelled" },
          stayId: stay._id,
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
        "rooms.roomId rooms.roomName"
      ).lean();

      const occupiedRoomKeys = new Set<string>();
      overlappingBookings.forEach((booking) => {
        booking.rooms?.forEach((room: any) => {
          const key = room.roomId ? room.roomId.toString() : room.roomName;
          if (key) occupiedRoomKeys.add(key);
        });
      });

      const normalizedRooms = rooms.map((requested: any) => {
        let stayRoom =
          stay.rooms.id(requested.roomId) ||
          stay.rooms.find((room: any) => room.name === requested.roomName);

        if (!stayRoom && stay.category === "bnbs" && stay.bnb) {
          stayRoom = {
            _id: undefined,
            name: stay.bnb.unitType || stay.name,
            price: stay.bnb.price,
            taxes: 0,
          };
        }
        if (!stayRoom) {
          throw new Error(`Room ${requested.roomName || requested.roomId} not found`);
        }

        const quantity = Number(requested.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Invalid room quantity");
        }

        const pricePerNight = Number(
          requested.pricePerNight ?? stayRoom.price ?? stay.bnb?.price ?? 0
        );
        const roomTaxes = Number(requested.taxes ?? stayRoom.taxes ?? 0);
        const total = (pricePerNight + roomTaxes) * quantity * nights;

        subtotal += pricePerNight * quantity * nights;
        taxes += roomTaxes * quantity * nights;

        return {
          roomId: stayRoom._id,
          roomName: stayRoom.name,
          quantity,
          pricePerNight,
          taxes: roomTaxes,
          nights,
          total,
          addons: Array.isArray(requested.addons) ? requested.addons : [],
        };
      });

      // Apply Coupon
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        appliedCoupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (appliedCoupon) {
          const now = new Date();
          const subtotalForCoupon = subtotal + taxes; // Determine if taxes are included in minPurchase
          if (
            appliedCoupon.startDate <= now &&
            appliedCoupon.expiryDate >= now &&
            subtotalForCoupon >= appliedCoupon.minPurchase &&
            (!appliedCoupon.usageLimit || appliedCoupon.usageCount < appliedCoupon.usageLimit)
          ) {
            if (appliedCoupon.discountType === "percentage") {
              discountAmount = (subtotalForCoupon * appliedCoupon.discountAmount) / 100;
              if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
                discountAmount = appliedCoupon.maxDiscount;
              }
            } else {
              discountAmount = appliedCoupon.discountAmount;
            }
            discountAmount = Math.min(discountAmount, subtotalForCoupon);
          }
        }
      }

      bookingPayload = {
        ...bookingPayload,
        stayId: stay._id,
        vendorId: stay.vendorId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests: parsedGuests,
        rooms: normalizedRooms,
        items: [],
        subtotal,
        taxes,
        totalAmount: subtotal + taxes + bookingPayload.fees - discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount,
      };

      const conflicts = normalizedRooms
        .filter((room) => {
          const key = room.roomId ? room.roomId.toString() : room.roomName;
          return key ? occupiedRoomKeys.has(key) : false;
        })
        .map((room) => room.roomName);

      if (conflicts.length) {
        return NextResponse.json(
          {
            success: false,
            message: `The following rooms are already booked for these dates: ${conflicts.join(
              ", "
            )}. Please choose different rooms or dates.`,
          },
          { status: 409 }
        );
      }

      const booking = await Booking.create(bookingPayload);

      if (appliedCoupon && discountAmount > 0) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
      }

      const settlementDueDate = new Date(checkOutDate);
      settlementDueDate.setDate(settlementDueDate.getDate() + 7);

      await Settlement.create({
        bookingId: booking._id,
        stayId: stay._id,
        vendorId: stay.vendorId,
        amountDue: booking.totalAmount,
        amountPaid: 0,
        currency,
        scheduledDate: settlementDueDate,
        status: "pending",
        notes: "Auto-generated from booking",
      });

      await sendBookingEmails(booking, { start: checkInDate, end: checkOutDate });

      return NextResponse.json({ success: true, booking });
    }

    if (serviceType === "tour") {
      if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        return NextResponse.json({ success: false, message: "Invalid tour id" }, { status: 400 });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: "Select at least one tour option" }, { status: 400 });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return NextResponse.json({ success: false, message: "Invalid start/end dates" }, { status: 400 });
      }

      const tour = await Tour.findById(tourId);
      if (!tour || !(tour as any).isActive) {
        return NextResponse.json({ success: false, message: "Tour not found" }, { status: 404 });
      }

      const days = calculateDays(start, end);

      const overlappingBookings = await Booking.find(
        {
          status: { $ne: "cancelled" },
          tourId: tour._id,
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
        "items.itemId items.itemName"
      ).lean();

      const occupiedOptionKeys = new Set<string>();
      overlappingBookings.forEach((booking) => {
        booking.items?.forEach((item: any) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          if (key) occupiedOptionKeys.add(key);
        });
      });

      const normalizedItems = items.map((requested: any) => {
        const option =
          tour.options.id(requested.optionId) ||
          tour.options.find((opt: any) => opt.name === requested.optionName);
        if (!option) {
          throw new Error(`Option ${requested.optionName || requested.optionId} not found`);
        }

        const quantity = Number(requested.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Invalid option quantity");
        }

        const pricePerUnit = Number(requested.price ?? option.price);
        const optionTaxes = Number(requested.taxes ?? option.taxes ?? 0);
        subtotal += pricePerUnit * quantity * days;
        taxes += optionTaxes * quantity * days;

        return {
          itemId: option._id,
          itemName: option.name,
          quantity,
          pricePerUnit,
          taxes: optionTaxes,
          metadata: {
            duration: option.duration,
            capacity: option.capacity,
          },
        };
      });

      bookingPayload = {
        ...bookingPayload,
        tourId: tour._id,
        vendorId: tour.vendorId,
        startDate: start,
        endDate: end,
        nights: days,
        guests: parsedGuests,
        rooms: [],
        items: normalizedItems,
        subtotal,
        taxes,
        totalAmount: subtotal + taxes + bookingPayload.fees,
      };

      // Apply Coupon
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        appliedCoupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (appliedCoupon) {
          const now = new Date();
          const subtotalForCoupon = subtotal + taxes;
          if (
            appliedCoupon.startDate <= now &&
            appliedCoupon.expiryDate >= now &&
            subtotalForCoupon >= appliedCoupon.minPurchase &&
            (!appliedCoupon.usageLimit || appliedCoupon.usageCount < appliedCoupon.usageLimit)
          ) {
            if (appliedCoupon.discountType === "percentage") {
              discountAmount = (subtotalForCoupon * appliedCoupon.discountAmount) / 100;
              if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
                discountAmount = appliedCoupon.maxDiscount;
              }
            } else {
              discountAmount = appliedCoupon.discountAmount;
            }
            discountAmount = Math.min(discountAmount, subtotalForCoupon);
          }
        }
      }

      bookingPayload.totalAmount -= discountAmount;
      bookingPayload.couponCode = appliedCoupon ? appliedCoupon.code : null;
      bookingPayload.discountAmount = discountAmount;

      const conflictingItems = normalizedItems
        .filter((item) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          return key ? occupiedOptionKeys.has(key) : false;
        })
        .map((item) => item.itemName);

      if (conflictingItems.length) {
        return NextResponse.json(
          {
            success: false,
            message: `The following tour options are already booked for these dates: ${conflictingItems.join(
              ", "
            )}.`,
          },
          { status: 409 }
        );
      }

      const booking = await Booking.create(bookingPayload);

      if (appliedCoupon && discountAmount > 0) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
      }

      await sendBookingEmails(booking, { start, end });

      return NextResponse.json({ success: true, booking });
    }

    if (serviceType === "adventure") {
      if (!adventureId || !mongoose.Types.ObjectId.isValid(adventureId)) {
        return NextResponse.json({ success: false, message: "Invalid adventure id" }, { status: 400 });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: "Select at least one adventure option" }, { status: 400 });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return NextResponse.json({ success: false, message: "Invalid start/end dates" }, { status: 400 });
      }

      const adventure = await Adventure.findById(adventureId);
      if (!adventure || !(adventure as any).isActive) {
        return NextResponse.json({ success: false, message: "Adventure not found" }, { status: 404 });
      }

      const days = calculateDays(start, end);

      const overlappingBookings = await Booking.find(
        {
          status: { $ne: "cancelled" },
          adventureId: adventure._id,
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
        "items.itemId items.itemName"
      ).lean();

      const occupiedOptionKeys = new Set<string>();
      overlappingBookings.forEach((booking) => {
        booking.items?.forEach((item: any) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          if (key) occupiedOptionKeys.add(key);
        });
      });

      const normalizedItems = items.map((requested: any) => {
        const option =
          adventure.options.id(requested.optionId) ||
          adventure.options.find((opt: any) => opt.name === requested.optionName);
        if (!option) {
          throw new Error(`Option ${requested.optionName || requested.optionId} not found`);
        }

        const quantity = Number(requested.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Invalid option quantity");
        }

        const pricePerUnit = Number(requested.price ?? option.price);
        const optionTaxes = Number(requested.taxes ?? option.taxes ?? 0);
        subtotal += pricePerUnit * quantity * days;
        taxes += optionTaxes * quantity * days;

        return {
          itemId: option._id,
          itemName: option.name,
          quantity,
          pricePerUnit,
          taxes: optionTaxes,
          metadata: {
            duration: option.duration,
            difficulty: option.difficulty,
            capacity: option.capacity,
          },
        };
      });

      bookingPayload = {
        ...bookingPayload,
        adventureId: adventure._id,
        vendorId: adventure.vendorId,
        startDate: start,
        endDate: end,
        nights: days,
        guests: parsedGuests,
        rooms: [],
        items: normalizedItems,
        subtotal,
        taxes,
        totalAmount: subtotal + taxes + bookingPayload.fees,
      };

      // Apply Coupon
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        appliedCoupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (appliedCoupon) {
          const now = new Date();
          const subtotalForCoupon = subtotal + taxes;
          if (
            appliedCoupon.startDate <= now &&
            appliedCoupon.expiryDate >= now &&
            subtotalForCoupon >= appliedCoupon.minPurchase &&
            (!appliedCoupon.usageLimit || appliedCoupon.usageCount < appliedCoupon.usageLimit)
          ) {
            if (appliedCoupon.discountType === "percentage") {
              discountAmount = (subtotalForCoupon * appliedCoupon.discountAmount) / 100;
              if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
                discountAmount = appliedCoupon.maxDiscount;
              }
            } else {
              discountAmount = appliedCoupon.discountAmount;
            }
            discountAmount = Math.min(discountAmount, subtotalForCoupon);
          }
        }
      }

      bookingPayload.totalAmount -= discountAmount;
      bookingPayload.couponCode = appliedCoupon ? appliedCoupon.code : null;
      bookingPayload.discountAmount = discountAmount;

      const conflictingItems = normalizedItems
        .filter((item) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          return key ? occupiedOptionKeys.has(key) : false;
        })
        .map((item) => item.itemName);

      if (conflictingItems.length) {
        return NextResponse.json(
          {
            success: false,
            message: `These adventure options are already booked for the selected dates: ${conflictingItems.join(
              ", "
            )}.`,
          },
          { status: 409 }
        );
      }

      const booking = await Booking.create(bookingPayload);

      if (appliedCoupon && discountAmount > 0) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
      }

      await sendBookingEmails(booking, { start, end });

      return NextResponse.json({ success: true, booking });
    }

    if (serviceType === "vehicle") {
      if (!vehicleRentalId || !mongoose.Types.ObjectId.isValid(vehicleRentalId)) {
        return NextResponse.json({ success: false, message: "Invalid vehicle rental id" }, { status: 400 });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: "Select at least one vehicle" }, { status: 400 });
      }

      const pickup = new Date(pickupDate);
      const dropoff = new Date(dropoffDate);
      if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime()) || dropoff <= pickup) {
        return NextResponse.json({ success: false, message: "Invalid pickup/dropoff dates" }, { status: 400 });
      }

      const rental = await VehicleRental.findById(vehicleRentalId);
      if (!rental || !(rental as any).isActive) {
        return NextResponse.json({ success: false, message: "Vehicle rental not found" }, { status: 404 });
      }

      const days = calculateDays(pickup, dropoff);

      const overlappingBookings = await Booking.find(
        {
          status: { $ne: "cancelled" },
          vehicleRentalId: rental._id,
          pickupDate: { $lt: dropoff },
          dropoffDate: { $gt: pickup },
        },
        "items.itemId items.itemName"
      ).lean();

      const occupiedVehicleKeys = new Set<string>();
      overlappingBookings.forEach((booking) => {
        booking.items?.forEach((item: any) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          if (key) occupiedVehicleKeys.add(key);
        });
      });

      const normalizedItems = items.map((requested: any) => {
        const option =
          rental.options.id(requested.optionId) ||
          rental.options.find(
            (opt: any) =>
              (opt._id?.toString() ?? opt.model) === requested.optionId ||
              opt.model === requested.optionName
          );
        if (!option) {
          throw new Error(`Vehicle ${requested.optionName || requested.optionId} not found`);
        }

        const quantity = Number(requested.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Invalid vehicle quantity");
        }

        const pricePerUnit = Number(requested.price ?? requested.pricePerDay ?? option.pricePerDay);
        const optionTaxes = Number(requested.taxes ?? option.taxes ?? 0);
        subtotal += pricePerUnit * quantity * days;
        taxes += optionTaxes * quantity * days;

        return {
          itemId: option._id,
          itemName: option.model,
          quantity,
          pricePerUnit,
          taxes: optionTaxes,
          metadata: {
            type: option.type,
          },
        };
      });

      bookingPayload = {
        ...bookingPayload,
        vehicleRentalId: rental._id,
        vendorId: rental.vendorId,
        pickupDate: pickup,
        dropoffDate: dropoff,
        nights: days,
        guests: parsedGuests,
        rooms: [],
        items: normalizedItems,
        subtotal,
        taxes,
        totalAmount: subtotal + taxes + bookingPayload.fees,
      };

      // Apply Coupon
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        appliedCoupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (appliedCoupon) {
          const now = new Date();
          const subtotalForCoupon = subtotal + taxes;
          if (
            appliedCoupon.startDate <= now &&
            appliedCoupon.expiryDate >= now &&
            subtotalForCoupon >= appliedCoupon.minPurchase &&
            (!appliedCoupon.usageLimit || appliedCoupon.usageCount < appliedCoupon.usageLimit)
          ) {
            if (appliedCoupon.discountType === "percentage") {
              discountAmount = (subtotalForCoupon * appliedCoupon.discountAmount) / 100;
              if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
                discountAmount = appliedCoupon.maxDiscount;
              }
            } else {
              discountAmount = appliedCoupon.discountAmount;
            }
            discountAmount = Math.min(discountAmount, subtotalForCoupon);
          }
        }
      }

      bookingPayload.totalAmount -= discountAmount;
      bookingPayload.couponCode = appliedCoupon ? appliedCoupon.code : null;
      bookingPayload.discountAmount = discountAmount;

      const conflictingVehicles = normalizedItems
        .filter((item) => {
          const key = item.itemId ? item.itemId.toString() : item.itemName;
          return key ? occupiedVehicleKeys.has(key) : false;
        })
        .map((item) => item.itemName);

      if (conflictingVehicles.length) {
        return NextResponse.json(
          {
            success: false,
            message: `These vehicles are already booked for the selected dates: ${conflictingVehicles.join(
              ", "
            )}.`,
          },
          { status: 409 }
        );
      }

      const booking = await Booking.create(bookingPayload);

      if (appliedCoupon && discountAmount > 0) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
      }

      await sendBookingEmails(booking, { start: pickup, end: dropoff });

      return NextResponse.json({ success: true, booking });
    }

    return NextResponse.json({ success: false, message: "Unsupported service type" }, { status: 400 });
  } catch (error: any) {
    console.error("Booking creation error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

export const GET = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vendorIdParam = searchParams.get("vendorId");

    const query: any = {};

    if (status) query.status = status;

    if (user.accountType === "admin") {
      if (vendorIdParam) {
        if (!mongoose.Types.ObjectId.isValid(vendorIdParam)) {
          return NextResponse.json(
            { success: false, message: "Invalid vendor id" },
            { status: 400 }
          );
        }
        query.vendorId = vendorIdParam;
      }
    } else if (user.accountType === "vendor") {
      query.vendorId = user.id;
    } else {
      query.$or = [{ customerId: user.id }, { "customer.email": user.email }];
    }

    const bookings = await Booking.find(query)
      .populate("stayId", "name category location vendorId")
      .populate("tourId", "name category location vendorId")
      .populate("adventureId", "name category location vendorId")
      .populate("vehicleRentalId", "name category location vendorId")
      .populate("vendorId", "fullName email contactNumber")
      .populate({ path: "cancelledBy", select: "fullName email accountType", strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("Booking fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
});
