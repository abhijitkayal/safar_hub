// models/UserAddress.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUserAddress extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String },
  },
  { timestamps: true }
);

// Index for fast user lookup
AddressSchema.index({ user: 1 });

export default mongoose.models.UserAddress ||
  mongoose.model<IUserAddress>("UserAddress", AddressSchema);

