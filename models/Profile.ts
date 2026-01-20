import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  gender?: string;
  dateOfBirth?: string;
  about?: string;
  addresses?: Array<Record<string, any>>;
}

const profileSchema = new Schema<IProfile>({
  gender: String,
  dateOfBirth: String,
  about: String,
  addresses: { type: [Object], default: [] },
});

export default mongoose.models.Profile ||
  mongoose.model<IProfile>("Profile", profileSchema);
