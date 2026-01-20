import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string; // URL-friendly version (e.g., "t-shirt" -> "t-shirt")
  requiresVariants: boolean; // true for jacket and t-shirt
  image?: string; // Optional image for navbar
  displayOrder: number; // For ordering in UI
  isActive: boolean;
  ownerType?: "admin" | "vendor";
  owner?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    requiresVariants: { type: Boolean, default: false },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ownerType: { type: String, enum: ["admin", "vendor"], default: "admin" },
    owner: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Index for efficient queries
categorySchema.index({ slug: 1, ownerType: 1, owner: 1 }, { unique: true, name: "slug_owner_unique" });
categorySchema.index({ name: 1, ownerType: 1, owner: 1 }, { unique: true, name: "name_owner_unique" });
categorySchema.index({ displayOrder: 1 });

const dropLegacyUniqueIndexes = () => {
  const collection = mongoose.connection.collections["categories"];
  if (!collection) return;

  collection.dropIndex("name_1").catch((err) => {
    if (err?.codeName !== "IndexNotFound") console.warn("Failed to drop legacy name index", err);
  });
  collection.dropIndex("slug_1").catch((err) => {
    if (err?.codeName !== "IndexNotFound") console.warn("Failed to drop legacy slug index", err);
  });
};

if (mongoose.connection.readyState > 0) {
  dropLegacyUniqueIndexes();
} else {
  mongoose.connection.once("connected", dropLegacyUniqueIndexes);
}

export default mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

