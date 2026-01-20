// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Placed";

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  variantId?: mongoose.Types.ObjectId | null;
  variant?: {
    color?: string;
    size?: string;
    price?: number;
    photos?: string[];
  } | null;
  status?: OrderStatus;
  deliveryDate?: Date | null;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  address: {
    name: string;
    phone: string;
    pincode: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
  };
  status: OrderStatus;
  couponCode?: string | null;
  discountAmount?: number;
  cancellationReason?: string | null;
  cancelledBy?: mongoose.Types.ObjectId | null;
  cancelledAt?: Date | null;
  cancelledByRole?: "user" | "vendor" | "admin" | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ["Product", "Stay", "Tour", "Adventure", "VehicleRental"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    variantId: { type: Schema.Types.ObjectId, default: null },
    variant: {
      color: String,
      size: String,
      price: Number,
      photos: { type: [String], default: [] },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Placed"],
      default: "Pending",
    },
    deliveryDate: { type: Date, default: null },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 15, min: 0 },
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      landmark: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Placed"],
      default: "Pending",
    },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    cancellationReason: { type: String, default: null },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    cancelledAt: { type: Date, default: null },
    cancelledByRole: { type: String, enum: ["user", "vendor", "admin"], default: null },
  },
  { timestamps: true }
);

// Index for fast user lookup
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

