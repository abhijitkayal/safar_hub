import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Invoice from "@/models/Invoice";
import jwt from "jsonwebtoken";

async function verifyAdmin(req: NextRequest) {
      const authHeader = req.headers.get("authorization");
      const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      const tokenFromCookie = req.cookies.get("token")?.value;
      const token = tokenFromHeader || tokenFromCookie;

      if (!token || !process.env.JWT_SECRET) return null;
      try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
            return decoded.accountType === "admin" ? decoded : null;
      } catch {
            return null;
      }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
            await dbConnect();
            const admin = await verifyAdmin(req);
            if (!admin) {
                  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
            }

            const { id } = await params;
            const invoice = await Invoice.findById(id).lean();

            if (!invoice) {
                  return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, invoice });
      } catch (error: any) {
            console.error("Invoice GET error:", error);
            return NextResponse.json({ success: false, message: "Failed to fetch invoice" }, { status: 500 });
      }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
            await dbConnect();
            const admin = await verifyAdmin(req);
            if (!admin) {
                  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
            }

            const { id } = await params;
            const deletedInvoice = await Invoice.findByIdAndDelete(id);

            if (!deletedInvoice) {
                  return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
      } catch (error: any) {
            console.error("Invoice DELETE error:", error);
            return NextResponse.json({ success: false, message: "Failed to delete invoice" }, { status: 500 });
      }
}
