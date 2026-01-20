import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Invoice from "@/models/Invoice";

export const GET = auth(async (req: NextRequest) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const invoices = await Invoice.find({})
                  .sort({ createdAt: -1 })
                  .lean();

            return NextResponse.json({
                  success: true,
                  invoices,
            });
      } catch (error: any) {
            console.error("Invoices GET error:", error);
            return NextResponse.json(
                  { success: false, message: "Failed to fetch invoices" },
                  { status: 500 }
            );
      }
});

export const POST = auth(async (req: NextRequest) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const body = await req.json();
            const {
                  customerName,
                  customerEmail,
                  customerPhone,
                  customerAddress,
                  items,
                  subtotal,
                  tax,
                  discount,
                  totalAmount,
                  dueDate,
                  notes,
            } = body;

            // Generate unique invoice number
            const count = await Invoice.countDocuments();
            const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1)
                  .toString()
                  .padStart(4, "0")}`;

            const newInvoice = await Invoice.create({
                  invoiceNumber,
                  customerName,
                  customerEmail,
                  customerPhone,
                  customerAddress,
                  items,
                  subtotal,
                  tax,
                  discount,
                  totalAmount,
                  dueDate,
                  notes,
                  status: "Pending",
            });

            return NextResponse.json({
                  success: true,
                  message: "Invoice created successfully",
                  invoice: newInvoice,
            });
      } catch (error: any) {
            console.error("Invoice POST error:", error);
            return NextResponse.json(
                  { success: false, message: "Failed to create invoice" },
                  { status: 500 }
            );
      }
});
