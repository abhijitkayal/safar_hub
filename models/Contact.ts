import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
      name: string;
      email: string;
      countryCode: string;
      contact: string;
    
      requirement: string;
     
}

const contactSchema = new Schema<IContact>(
      {
            name: { type: String, required: true },
            email: { type: String, required: true, index: true },
            countryCode: { type: String, required: true },
            contact: { type: String, required: true },
           
            requirement: { type: String, required: true },
           
         
      },
      { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);
