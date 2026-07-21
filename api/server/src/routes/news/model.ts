import mongoose, { Document } from "mongoose";

export interface INewsArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl?: string;
  category: string;
  author: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsArticleSchema = new mongoose.Schema<INewsArticle>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true },
  category: { type: String, default: "Tennis", trim: true },
  author: { type: String, default: "ATP Editorial", trim: true },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

const NewsArticle = mongoose.model<INewsArticle>("NewsArticle", newsArticleSchema);

export default NewsArticle;
