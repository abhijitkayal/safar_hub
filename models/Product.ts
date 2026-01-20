import mongoose, { Schema, Document } from "mongoose";

export interface IVariant extends Document {
  color: string;
  size: string;
  stock: number;
  photos: string[];
  price?: number;
}

export interface IProduct extends Document {
  name: string;
  category: string; // Dynamic category (references Category.slug)
  description: string;
  basePrice: number;
  images: string[]; // Main product images
  variants?: IVariant[]; // For products with variants (jacket, t-shirt)
  tags?: string[];
  isActive: boolean;
  sellerId?: mongoose.Types.ObjectId;
  stock?: number; // Add stock field for non-variant products
  outOfStock?: boolean;
  listingType: "buy" | "rent";
  rentPriceDay?: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const variantSchema = new Schema<IVariant>(
  {
    color: { type: String, required: true },
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    photos: { type: [String], default: [] },
    price: { type: Number, min: 0 },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true, default: [] },
    variants: { type: [variantSchema], default: [] },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    stock: { type: Number, default: 0, min: 0 }, // Add stock field for non-variant products
    outOfStock: { type: Boolean, default: false },
    listingType: {
      type: String,
      enum: ["buy", "rent"],
      default: "buy",
      required: true,
    },
    rentPriceDay: { type: Number, min: 0 },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ sellerId: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

