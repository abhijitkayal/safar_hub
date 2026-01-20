import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Booking, { BookingStatus, PaymentStatus } from "@/models/Booking";
import Settlement from "@/models/Settlement";
import { auth } from "@/lib/middlewares/auth";
import { mailSender } from "@/lib/utils/mailSender";
import bookingStatusUpdateTemplate from "@/lib/mail/templates/bookingStatusUpdateTemplate";
import bookingCancelledVendorTemplate from "@/lib/mail/templates/bookingCancelledVendorTemplate";
import User from "@/models/User";

const ensureObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

export const GET = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    if (!context) {
      return NextResponse.json({ success: false, message: "Missing route parameters" }, { status: 400 });
    }
    const { id } = await context.params;

    if (!ensureObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid booking id" }, { status: 400 });
    }

    const bookingDoc = await Booking.findById(id)
      .populate("stayId", "name category location vendorId")
      .lean();

    if (!bookingDoc) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const booking = bookingDoc as any;
    const vendorId = booking.stayId?.vendorId?.toString() ?? booking.vendorId?.toString();

    if (user.accountType === "admin") {
      return NextResponse.json({ success: true, booking });
    }

    if (user.accountType === "vendor") {
      if (vendorId !== user.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.json({ success: true, booking });
    }

    if (booking.customerId?.toString() === user.id || booking.customer?.email === user.email) {
      return NextResponse.json({ success: true, booking });
    }

    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  } catch (error: any) {
    console.error("Booking detail error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    if (!context) {
      return NextResponse.json({ success: false, message: "Missing route parameters" }, { status: 400 });
    }
    const { id } = await context.params;

    if (!ensureObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid booking id" }, { status: 400 });
    }

    const bookingDoc = await Booking.findById(id);
    if (!bookingDoc) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const body = await req.json();

    const booking = bookingDoc as any;
    const vendorId = booking.vendorId?.toString();
    const isCustomer =
      booking.customerId?.toString() === user.id || booking.customer?.email === user.email;
    const isVendor = vendorId === user.id;
    const isAdmin = user.accountType === "admin";

    if (!isAdmin && !isVendor && !(isCustomer && body?.status === "cancelled")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const updates: Record<string, any> = {};

    let previousStatus: BookingStatus | undefined;

    const reasonFromBody = typeof body.reason === "string" ? body.reason.trim() : "";

    if (body.status) {
      previousStatus = booking.status as BookingStatus;
      const nextStatus = body.status as BookingStatus;
      if (!["pending", "confirmed", "completed", "cancelled"].includes(nextStatus)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      if (!isAdmin && !isVendor && nextStatus !== "cancelled") {
        return NextResponse.json(
          { success: false, message: "Customers can only cancel their booking." },
          { status: 403 }
        );
      }
      updates.status = nextStatus;
      if (nextStatus === "cancelled") {
        updates.cancelledAt = new Date();

        const fallbackReason = isCustomer
          ? "Customer cancelled the booking"
          : isVendor
            ? "Vendor cancelled the booking"
            : "Admin cancelled the booking";

        // Require a reason when the customer cancels
        if (isCustomer && !reasonFromBody) {
          return NextResponse.json(
            { success: false, message: "Cancellation reason is required" },
            { status: 400 }
          );
        }

        const actorId = user.id || user._id;
        if (actorId && mongoose.Types.ObjectId.isValid(actorId)) {
          updates.cancelledBy = new mongoose.Types.ObjectId(actorId);
        }
        updates.cancelledByRole = isAdmin ? "admin" : isVendor ? "vendor" : "user";
        updates.cancellationReason = reasonFromBody || booking.cancellationReason || fallbackReason;
      }
      // Set completedAt when status is "completed"
      // Always set it if status is completed (even if already completed, to ensure it's set)
      if (nextStatus === "completed") {
        // Only set if not already set or if status was changed to completed
        if (!booking.completedAt || booking.status !== "completed") {
          updates.completedAt = new Date();
        }
      }
      // Clear completedAt if status is changed away from "completed"
      if (nextStatus !== "completed" && booking.status === "completed") {
        updates.completedAt = null;
      }
    }

    if (body.paymentStatus) {
      const nextPaymentStatus = body.paymentStatus as PaymentStatus;
      if (!["unpaid", "pending", "paid", "refunded"].includes(nextPaymentStatus)) {
        return NextResponse.json({ success: false, message: "Invalid payment status" }, { status: 400 });
      }
      updates.paymentStatus = nextPaymentStatus;
    }

    if ((isAdmin || isVendor) && body.metadata && typeof body.metadata === "object") {
      updates.metadata = { ...booking.metadata, ...body.metadata };
    }

    if (isCustomer && reasonFromBody) {
      updates.metadata = {
        ...booking.metadata,
        userCancellationReason: reasonFromBody,
      };
    } else if (!isCustomer && reasonFromBody) {
      updates.metadata = {
        ...booking.metadata,
        staffCancellationReason: reasonFromBody,
      };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid fields to update" }, { status: 400 });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, { $set: updates }, { new: true });

    // Log when a booking is marked as completed for debugging
    if (body.status === "completed" && updatedBooking) {
      console.log(`Booking ${id} marked as completed. Amount: ${updatedBooking.totalAmount}, completedAt: ${updatedBooking.completedAt}`);
    }

    if (body.paymentStatus === "unpaid") {
      await Settlement.findOneAndUpdate(
        { bookingId: booking._id },
        {
          status: "unpaid",
          amountPaid: booking.totalAmount,
          paidAt: new Date(),
        }
      );
    }

    // Send email to user when vendor/admin changes booking status
    if (updatedBooking && body.status && previousStatus && body.status !== previousStatus) {
      // 1) Status-change email to user when vendor/admin changes it
      if ((isVendor || isAdmin) && updatedBooking.customer?.email) {
        try {
          await mailSender(
            updatedBooking.customer.email,
            "Your SafarHub booking status was updated",
            bookingStatusUpdateTemplate({
              fullName: updatedBooking.customer.fullName,
              email: updatedBooking.customer.email,
              serviceType: updatedBooking.serviceType,
              referenceCode: updatedBooking._id.toString(),
              newStatus: body.status,
            })
          );
        } catch (emailErr) {
          console.error("Booking status email error:", emailErr);
        }
      }

      // 2) Cancellation email to vendor when customer cancels with reason
      if (isCustomer && body.status === "cancelled") {
        try {
          const vendor = await User.findById(updatedBooking.vendorId);
          const vendorEmail = vendor?.email;
          const vendorName = vendor?.fullName || "Vendor";

          if (vendorEmail) {
            const reason =
              updatedBooking.cancellationReason ||
              (updatedBooking.metadata as any)?.userCancellationReason ||
              reasonFromBody ||
              "";

            await mailSender(
              vendorEmail,
              "A SafarHub booking was cancelled",
              bookingCancelledVendorTemplate({
                vendorName,
                vendorEmail,
                serviceType: updatedBooking.serviceType,
                referenceCode: updatedBooking._id.toString(),
                customerName: updatedBooking.customer.fullName,
                customerEmail: updatedBooking.customer.email,
                customerPhone: updatedBooking.customer.phone,
                reason,
              })
            );
          }
        } catch (emailErr) {
          console.error("Booking cancellation vendor email error:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error("Booking update error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
});
