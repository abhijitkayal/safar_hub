import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";
export type BookingServiceType = "stay" | "tour" | "adventure" | "vehicle";

export interface IBookingRoom {
  roomId?: mongoose.Types.ObjectId;
  roomName: string;
  quantity: number;
  pricePerNight: number;
  taxes: number;
  nights: number;
  total: number;
  addons?: string[];
}

export interface IBookingItem {
  itemId?: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  taxes: number;
  metadata?: Record<string, any>;
}

export interface IBooking extends Document {
  serviceType: BookingServiceType;
  stayId?: mongoose.Types.ObjectId;
  tourId?: mongoose.Types.ObjectId;
  adventureId?: mongoose.Types.ObjectId;
  vehicleRentalId?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId | null;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  checkIn?: Date;
  checkOut?: Date;
  startDate?: Date;
  endDate?: Date;
  pickupDate?: Date;
  dropoffDate?: Date;
  nights: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms: IBookingRoom[];
  items: IBookingItem[];
  currency: string;
  subtotal: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  couponCode?: string | null;
  discountAmount?: number;
  metadata?: Record<string, any>;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledByRole?: "user" | "vendor" | "admin";
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingRoomSchema = new Schema<IBookingRoom>(
  {
    roomId: { type: Schema.Types.ObjectId },
    roomName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    nights: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    addons: { type: [String], default: [] },
  },
  { _id: false }
);

const bookingItemSchema = new Schema<IBookingItem>(
  {
    itemId: { type: Schema.Types.ObjectId },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    metadata: Schema.Types.Mixed,
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    serviceType: {
      type: String,
      enum: ["stay", "tour", "adventure", "vehicle"],
      default: "stay",
      index: true,
    },
    stayId: { type: Schema.Types.ObjectId, ref: "Stay", index: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", index: true },
    adventureId: { type: Schema.Types.ObjectId, ref: "Adventure", index: true },
    vehicleRentalId: { type: Schema.Types.ObjectId, ref: "VehicleRental", index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      notes: String,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    pickupDate: { type: Date },
    dropoffDate: { type: Date },
    nights: { type: Number, required: true, min: 1 },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    rooms: { type: [bookingRoomSchema], default: [] },
    items: { type: [bookingItemSchema], default: [] },
    currency: { type: String, default: "INR" },
    subtotal: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    fees: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },
    paymentReference: String,
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    metadata: Schema.Types.Mixed,
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancelledByRole: { type: String, enum: ["user", "vendor", "admin"], default: null },
    completedAt: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ stayId: 1, checkIn: 1 });
bookingSchema.index({ tourId: 1, startDate: 1 });
bookingSchema.index({ adventureId: 1, startDate: 1 });
bookingSchema.index({ vehicleRentalId: 1, pickupDate: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ vendorId: 1, status: 1, completedAt: 1 });
bookingSchema.index({ "customer.email": 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
