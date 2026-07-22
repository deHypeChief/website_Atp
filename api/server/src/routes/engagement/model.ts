import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, default: false },
  votes: { type: Number, default: 0, min: 0 },
}, { _id: true });

const engagementSchema = new mongoose.Schema({
  kind: { type: String, enum: ["quiz", "poll"], required: true },
  question: { type: String, required: true, trim: true },
  kicker: { type: String, default: "Clubhouse question", trim: true },
  explanation: { type: String, default: "", trim: true },
  options: { type: [optionSchema], validate: [(value: unknown[]) => value.length >= 2, "At least two options are required"] },
  status: { type: String, enum: ["draft", "published", "closed"], default: "draft" },
  featured: { type: Boolean, default: false },
  closesAt: { type: Date },
  totalResponses: { type: Number, default: 0, min: 0 },
  participants: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("Engagement", engagementSchema);
