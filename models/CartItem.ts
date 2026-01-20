// models/CartItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem extends Document {
  user: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  variantId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ["Product", "Stay", "Tour", "Adventure", "VehicleRental"],
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
    variantId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

// Unique compound index: one item per user per itemId (+ variant when applicable)
CartItemSchema.index({ user: 1, itemId: 1, itemType: 1, variantId: 1 }, { unique: true });

// Index for fast user lookup
CartItemSchema.index({ user: 1 });

export default mongoose.models.CartItem ||
  mongoose.model<ICartItem>("CartItem", CartItemSchema);

