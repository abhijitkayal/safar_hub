import mongoose, { Schema, Document } from "mongoose";

export interface ISupport extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  adminReply?: string;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId; // Admin who replied
  createdAt?: Date;
  updatedAt?: Date;
}

const supportSchema = new Schema<ISupport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "replied", "closed"], default: "open", index: true },
    adminReply: { type: String },
    repliedAt: { type: Date },
    repliedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Index for efficient queries
supportSchema.index({ userId: 1, createdAt: -1 });
supportSchema.index({ status: 1, createdAt: -1 });

// Force model recompilation to ensure new fields are recognized
if (mongoose.models.Support) {
  delete (mongoose.models as any).Support;
}

export default mongoose.model<ISupport>("Support", supportSchema);

