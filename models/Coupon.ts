
import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
      code: string;
      discountType: "percentage" | "fixed";
      discountAmount: number;
      minPurchase: number;
      maxDiscount?: number;
      startDate: Date;
      expiryDate: Date;
      usageLimit?: number;
      usageCount: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
      {
            code: {
                  type: String,
                  required: true,
                  unique: true,
                  trim: true,
                  uppercase: true,
            },
            discountType: {
                  type: String,
                  enum: ["percentage", "fixed"],
                  required: true,
            },
            discountAmount: {
                  type: Number,
                  required: true,
                  min: 0,
            },
            minPurchase: {
                  type: Number,
                  default: 0,
                  min: 0,
            },
            maxDiscount: {
                  type: Number,
                  min: 0,
            },
            startDate: {
                  type: Date,
                  default: Date.now,
            },
            expiryDate: {
                  type: Date,
                  required: true,
            },
            usageLimit: {
                  type: Number,
                  min: 1,
            },
            usageCount: {
                  type: Number,
                  default: 0,
            },
            isActive: {
                  type: Boolean,
                  default: true,
            },
      },
      { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
