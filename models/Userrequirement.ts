// import mongoose, { Schema, Document } from "mongoose";

// export interface IUserRequirement extends Document {
//   user: mongoose.Types.ObjectId;
//   title: string;
//   categories: string[];
//   description?: string;
//   status: "open" | "closed";
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const userRequirementSchema = new Schema<IUserRequirement>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 120,
//     },

//     categories: {
//       type: [String],
//       required: true,
//       enum: [
//         "home-stays",
//         "bnb",
//         "resorts",
//         "hotels",
//         "vehicle-rent",
//         "market-place",
//         "package-tour",
//       ],
//     },

//     description: {
//       type: String,
//       trim: true,
//       maxlength: 1000,
//     },

//     status: {
//       type: String,
//       enum: ["open", "closed"],
//       default: "open",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.UserRequirement ||
//   mongoose.model<IUserRequirement>("UserRequirement", userRequirementSchema);



import mongoose, { Schema, Document } from "mongoose";

export interface IRequirementComment {
  vendor: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IUserRequirement extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  categories: string[];
  comments: IRequirementComment[];
  createdAt: Date;
}

const CommentSchema = new Schema<IRequirementComment>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const UserRequirementSchema = new Schema<IUserRequirement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    categories: [{
      type: String,
      required: true,
      enum: ["stays", "adventure", "tour", "vehicle-rental", "market-place", "tours", "products"]
    }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.UserRequirement ||
  mongoose.model<IUserRequirement>("UserRequirement", UserRequirementSchema);
