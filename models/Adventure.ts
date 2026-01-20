// models/Adventure.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAdventure extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
  duration: string;
  price: number;
  capacity: number;
  difficultyLevel?: string;
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
  amenities: Record<string, string[]>; // Grouped facilities (e.g. Equipment, Activities…)
  features: string[];
  options: Array<{
    _id?: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    duration: string;
    difficulty: string;
    capacity: number;
    price: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities: string[];
    available: number;
    images: string[]; // Minimum 3 per option
    isRefundable?: boolean;
    refundableUntilHours?: number;
  }>;
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  itinerary: Array<{
    heading: string;
    description: string;
  }>;
  inclusions?: string;
  exclusions?: string;
  policyTerms?: string;
  about: {
    heading: string;
    description: string;
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

const adventureSchema = new Schema<IAdventure>(
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
      enum: ["trekking", "hiking", "camping", "water-rafting"],
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
    duration: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    difficultyLevel: { type: String },
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
        message: "At least 5 adventure images are required",
      },
    },
    gallery: { type: [String], default: [] },
    videos: {
      inside: { type: [String], default: [] },
      outside: { type: [String], default: [] },
    },
    popularFacilities: { type: [String], default: [] },
    amenities: { type: Map, of: [String], default: {} },
    features: { type: [String], default: [] },
    options: [
      {
        name: { type: String, required: true },
        description: String,
        duration: { type: String, required: true },
        difficulty: { type: String, required: true },
        capacity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
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
            message: "Each adventure option needs at least 3 images",
          },
        },
        isRefundable: { type: Boolean, default: true },
        refundableUntilHours: { type: Number, default: 48 },
      },
    ],
    defaultCancellationPolicy: String,
    defaultHouseRules: { type: [String], default: [] },
    itinerary: {
      type: [
        {
          heading: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      default: [],
    },
    inclusions: { type: String, default: "" },
    exclusions: { type: String, default: "" },
    policyTerms: { type: String, default: "" },
    about: {
      heading: { type: String, required: true },
      description: { type: String, required: true },
    },
    vendorMessage: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
adventureSchema.index({ vendorId: 1, category: 1 });
adventureSchema.index({ category: 1, isActive: 1 });
adventureSchema.index({ tags: 1 });

export default mongoose.models.Adventure || mongoose.model<IAdventure>("Adventure", adventureSchema);