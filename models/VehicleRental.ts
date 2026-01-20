// models/VehicleRental.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVehicleRental extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  category: "cars-rental" | "bikes-rentals" | "car-with-driver";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  heroHighlights: string[];
  curatedHighlights: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  images: string[]; // Minimum 5 required
  gallery: string[];
  videos: {
    inside?: string[];
    outside?: string[];
  };
  popularFacilities: string[]; // Quick badges with icons
  amenities: Record<string, string[]>; // Grouped facilities (e.g. Vehicle features…)
  options: Array<{
    _id?: mongoose.Types.ObjectId;
    model: string;
    description?: string;
    type: string;
    pricePerDay: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities: string[];
    available: number;
    images: string[]; // Minimum 3 per option
    isRefundable?: boolean;
    refundableUntilHours?: number;
    driver?: {
      name?: string;
      age?: number;
      experienceYears?: number;
    };
  }>;
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  about: {
    heading: string;
    description: string;
  };
  checkInOutRules: {
    pickup: string;
    dropoff: string;
    rules: string[];
  };
  vendorMessage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const highlightSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    icon: String,
  },
  { _id: false }
);

const vehicleRentalSchema = new Schema<IVehicleRental>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["cars-rental", "bikes-rentals", "car-with-driver"],
      required: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    heroHighlights: { type: [String], default: [] },
    curatedHighlights: { type: [highlightSchema], default: [] },
    tags: { type: [String], default: [] },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length >= 5;
        },
        message: "At least 5 vehicle images are required",
      },
    },
    gallery: { type: [String], default: [] },
    videos: {
      inside: { type: [String], default: [] },
      outside: { type: [String], default: [] },
    },
    popularFacilities: { type: [String], default: [] },
    amenities: { type: Map, of: [String], default: {} },
    options: [
      {
        model: { type: String, required: true },
        description: String,
        type: { type: String, required: true },
        pricePerDay: { type: Number, required: true, min: 0 },
        taxes: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: "INR" },
        features: { type: [String], default: [] },
        amenities: { type: [String], default: [] },
        available: { type: Number, required: true, min: 0 },
        images: {
          type: [String],
          required: true,
          validate: {
            validator: function (v: string[]) {
              return Array.isArray(v) && v.length >= 3;
            },
            message: "Each vehicle option needs at least 3 images",
          },
        },
        isRefundable: { type: Boolean, default: true },
        refundableUntilHours: { type: Number, default: 48 },
        driver: {
          name: { type: String, default: "" },
          age: { type: Number, default: 0 },
          experienceYears: { type: Number, default: 0 },
        },
      },
    ],
    defaultCancellationPolicy: String,
    defaultHouseRules: { type: [String], default: [] },
    about: {
      heading: { type: String, required: true },
      description: { type: String, required: true },
    },
    checkInOutRules: {
      pickup: { type: String, required: true },
      dropoff: { type: String, required: true },
      rules: { type: [String], default: [] },
    },
    vendorMessage: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
vehicleRentalSchema.index({ vendorId: 1, category: 1 });
vehicleRentalSchema.index({ category: 1, isActive: 1 });
vehicleRentalSchema.index({ tags: 1 });

export default mongoose.models.VehicleRental || mongoose.model<IVehicleRental>("VehicleRental", vehicleRentalSchema);