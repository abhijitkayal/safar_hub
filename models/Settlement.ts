import mongoose, { Schema, Document } from "mongoose";

export type SettlementStatus = "pending" | "processing" | "paid" | "cancelled";

export interface ISettlement extends Document {
  bookingId: mongoose.Types.ObjectId;
  stayId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  currency: string;
  scheduledDate: Date;
  paidAt?: Date | null;
  status: SettlementStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    stayId: { type: Schema.Types.ObjectId, ref: "Stay", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amountDue: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    scheduledDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "cancelled"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

settlementSchema.index({ vendorId: 1, status: 1 });
settlementSchema.index({ scheduledDate: 1 });

export default mongoose.models.Settlement || mongoose.model<ISettlement>("Settlement", settlementSchema);
