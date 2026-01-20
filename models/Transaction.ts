import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus = "pending" | "processing" | "completed" | "cancelled";

export interface ITransaction extends Document {
  vendorId: mongoose.Types.ObjectId;
  message: string;
  status: TransactionStatus;
  amount?: number;
  currency?: string;
  scheduledDate: Date;
  completedAt?: Date | null;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },
    scheduledDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    notes: String,
  },
  { timestamps: true }
);

transactionSchema.index({ vendorId: 1, status: 1 });
transactionSchema.index({ scheduledDate: 1 });
transactionSchema.index({ createdAt: -1 });

if (mongoose.models.Transaction) {
  delete mongoose.models.Transaction;
}

export default mongoose.model<ITransaction>("Transaction", transactionSchema);

