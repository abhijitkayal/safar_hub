import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminMeta extends Document {
  email: string;
  loginCount: number;
  lastLogin: Date | null;
}

const adminMetaSchema = new Schema<IAdminMeta>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

const AdminMeta: Model<IAdminMeta> =
  mongoose.models.AdminMeta || mongoose.model<IAdminMeta>("AdminMeta", adminMetaSchema);

export default AdminMeta;


