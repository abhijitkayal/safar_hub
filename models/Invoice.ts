import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceItem {
      description: string;
      quantity: number;
      price: number;
      amount: number;
}

export interface IInvoice extends Document {
      invoiceNumber: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
      items: IInvoiceItem[];
      subtotal: number;
      tax: number;
      discount: number;
      totalAmount: number;
      status: "Pending" | "Paid" | "Cancelled" | "Overdue";
      dueDate: Date;
      notes?: string;
      createdAt: Date;
      updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
      description: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      amount: { type: Number, required: true, min: 0 },
});

const InvoiceSchema = new Schema<IInvoice>(
      {
            invoiceNumber: { type: String, required: true, unique: true },
            customerName: { type: String, required: true },
            customerEmail: { type: String },
            customerPhone: { type: String },
            customerAddress: { type: String },
            items: { type: [InvoiceItemSchema], required: true },
            subtotal: { type: Number, required: true, min: 0 },
            tax: { type: Number, default: 0, min: 0 },
            discount: { type: Number, default: 0, min: 0 },
            totalAmount: { type: Number, required: true, min: 0 },
            status: {
                  type: String,
                  enum: ["Pending", "Paid", "Cancelled", "Overdue"],
                  default: "Pending",
            },
            dueDate: { type: Date, required: true },
            notes: { type: String },
      },
      { timestamps: true }
);

// Index for lookup
InvoiceSchema.index({ customerName: 1 });
InvoiceSchema.index({ status: 1 });

export default mongoose.models.Invoice ||
      mongoose.model<IInvoice>("Invoice", InvoiceSchema);
