import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  image?: string;
  content: string;
  published: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    image: { type: String },
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Auto-generate slug before save
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Index for efficient queries
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, createdAt: -1 });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);