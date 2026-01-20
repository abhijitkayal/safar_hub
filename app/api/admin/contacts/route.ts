import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Contact from "@/models/Contact";
import mongoose from "mongoose";

// GET - Fetch contact inquiries for admin
export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, contacts });
  } catch (error: any) {
    console.error("Admin contacts fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch contact inquiries" },
      { status: 500 }
    );
  }
});

// PATCH - Update contact inquiry status or add notes
export const PATCH = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { contactId, status, notes } = body;

    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return NextResponse.json({ success: false, message: "Invalid contact ID" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json({ success: false, message: "Contact inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error: any) {
    console.error("Admin contact update error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update contact inquiry" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a contact inquiry
export async function DELETE(req: NextRequest) {
  // We use auth manually here if needed or wrap it if our auth allows DELETE
  // Assuming our auth middleware works for all methods if wrapped
  return auth(async (innerReq: NextRequest) => {
    try {
      await dbConnect();
      const user = (innerReq as any).user;

      if (user.accountType !== "admin") {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
      }

      const { searchParams } = new URL(innerReq.url);
      const contactId = searchParams.get("contactId");

      if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
        return NextResponse.json({ success: false, message: "Invalid contact ID" }, { status: 400 });
      }

      const deleted = await Contact.findByIdAndDelete(contactId);

      if (!deleted) {
        return NextResponse.json({ success: false, message: "Contact inquiry not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
    } catch (error: any) {
      console.error("Admin contact delete error", error);
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete contact inquiry" },
        { status: 500 }
      );
    }
  })(req);
}
