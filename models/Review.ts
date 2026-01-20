import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
      userId: mongoose.Types.ObjectId;
      targetId: mongoose.Types.ObjectId;
      targetType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
      rating: number;
      message: string;
      images: string[];
      status: "pending" | "approved" | "rejected";
      createdAt?: Date;
      updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
      {
            userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            targetId: { type: Schema.Types.ObjectId, required: true, index: true },
            targetType: {
                  type: String,
                  enum: ["Product", "Stay", "Tour", "Adventure", "VehicleRental"],
                  required: true,
                  index: true,
            },
            rating: { type: Number, required: true, min: 1, max: 5 },
            message: { type: String, required: true },
            images: { type: [String], default: [] },
            status: {
                  type: String,
                  enum: ["pending", "approved", "rejected"],
                  default: "approved",
            },
      },
      { timestamps: true }
);

// Index to quickly find reviews for a specific item
reviewSchema.index({ targetId: 1, targetType: 1 });
// Index to prevent multiple reviews from same user for same item (optional, depending on requirements)
// reviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
