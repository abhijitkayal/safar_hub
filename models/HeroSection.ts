import mongoose, { Schema, Document, Types } from "mongoose";

type HeroStat = {
  label: string;
  value: string;
};

type HeroCta = {
  label: string;
  href: string;
};

type BookingDefaults = {
  location?: string;
  adults?: number;
  children?: number;
  rooms?: number;
};

export interface IHeroSection extends Document {
  headline: string;
  subheadline?: string;
  description?: string;
  highlight?: string;
  dynamicKeywords: string[];
  backgroundImages: string[];
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  stats: HeroStat[];
  featuredDestinations: string[];
  bookingDefaults?: BookingDefaults;
  updatedBy?: Types.ObjectId;
}

const heroStatSchema = new Schema<HeroStat>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const heroCtaSchema = new Schema<HeroCta>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
  },
  { _id: false }
);

const bookingDefaultsSchema = new Schema<BookingDefaults>(
  {
    location: { type: String },
    adults: { type: Number, min: 0 },
    children: { type: Number, min: 0 },
    rooms: { type: Number, min: 0 },
  },
  { _id: false }
);

const heroSectionSchema = new Schema<IHeroSection>(
  {
    headline: { type: String, required: true },
    subheadline: { type: String, default: "" },
    description: { type: String, default: "" },
    highlight: { type: String, default: "" },
    dynamicKeywords: { type: [String], default: [] },
    backgroundImages: { type: [String], default: [] },
    primaryCta: { type: heroCtaSchema, default: undefined },
    secondaryCta: { type: heroCtaSchema, default: undefined },
    stats: { type: [heroStatSchema], default: [] },
    featuredDestinations: { type: [String], default: [] },
    bookingDefaults: { type: bookingDefaultsSchema, default: undefined },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.HeroSection ||
  mongoose.model<IHeroSection>("HeroSection", heroSectionSchema);

