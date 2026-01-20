import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Single vendor lookup (used by vendor page polling)
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vendor id" },
        { status: 400 }
      );
    }

    const vendor = await User.findById(id).select(
      "isVendorApproved isVendorLocked vendorServices fullName email contactNumber createdAt accountType isSeller"
    );
    return NextResponse.json({ success: !!vendor, vendor: vendor || null });
  }

  // Check if we need only newly added vendors (for dashboard) or all accepted vendors (for partners page)
  const limit = searchParams.get("limit");
  const onlyApproved = searchParams.get("onlyApproved") === "true";
  const onlySellers = searchParams.get("onlySellers") === "true";

  let query: any = { accountType: "vendor" };
  
  if (onlySellers) {
    // For /admin/sellers - show all vendors who are sellers
    query.isSeller = true;
  } else if (onlyApproved) {
    // For /admin/partners - show all accepted and unlocked vendors
    query.isVendorApproved = true;
    query.isVendorLocked = false;
  }

  let vendorsQuery = User.find(query).select(
    "fullName email contactNumber vendorServices isVendorApproved isVendorLocked createdAt accountType isSeller"
  ).sort({ createdAt: -1 });

  if (limit) {
    vendorsQuery = vendorsQuery.limit(parseInt(limit));
  }

  const vendors = await vendorsQuery;

  return NextResponse.json({ success: true, vendors });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { vendorId, action } = body;

  const vendor = await User.findById(vendorId);
  if (!vendor) {
    return NextResponse.json(
      { success: false, message: "Vendor not found" },
      { status: 404 }
    );
  }

  // Initial approval/rejection (don't change this logic)
  if (action === "accept") {
    vendor.isVendorApproved = true;
    vendor.isVendorLocked = false; // Unlock when accepting
  }
  if (action === "reject") {
    vendor.isVendorApproved = false;
  }

  // Lock/unlock for approved vendors
  if (action === "lock") {
    if (!vendor.isVendorApproved) {
      return NextResponse.json(
        { success: false, message: "Cannot lock unapproved vendor" },
        { status: 400 }
      );
    }
    vendor.isVendorLocked = true;
  }
  if (action === "unlock") {
    vendor.isVendorLocked = false;
  }

  await vendor.save();

  // return the updated vendor document
  const updatedVendor = await User.findById(vendorId).select(
    "_id fullName email contactNumber vendorServices isVendorApproved isVendorLocked createdAt accountType isSeller"
  );

  return NextResponse.json({ success: true, vendor: updatedVendor });
}

// DELETE - Permanently delete vendor
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json(
      { success: false, message: "Vendor ID is required" },
      { status: 400 }
    );
  }

  const vendor = await User.findById(vendorId);
  if (!vendor) {
    return NextResponse.json(
      { success: false, message: "Vendor not found" },
      { status: 404 }
    );
  }

  if (vendor.accountType !== "vendor") {
    return NextResponse.json(
      { success: false, message: "User is not a vendor" },
      { status: 400 }
    );
  }

  await Promise.all([
    Stay.deleteMany({ vendorId }),
    Tour.deleteMany({ vendorId }),
    Adventure.deleteMany({ vendorId }),
    VehicleRental.deleteMany({ vendorId }),
  ]);

  // Permanently delete the vendor
  await User.findByIdAndDelete(vendorId);

  return NextResponse.json({ success: true, message: "Vendor deleted permanently" });
}