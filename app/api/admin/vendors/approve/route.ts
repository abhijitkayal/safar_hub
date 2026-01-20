// app/api/admin/vendor/approve/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import { mailSender } from "@/lib/utils/mailSender";
import vendorApprovedTemplate from "@/lib/mail/templates/vendorApprovedTemplate";

export async function POST(req: Request) {
  try {
    const { vendorId, status } = await req.json();
    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      vendorId,
      { isVendorApproved: status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    if (status === true && updated.accountType === "vendor") {
      try {
        await mailSender(
          updated.email,
          "Your SafarHub vendor access is unlocked",
          vendorApprovedTemplate({ fullName: updated.fullName })
        );
      } catch (emailErr) {
        console.error("Vendor approval email error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
