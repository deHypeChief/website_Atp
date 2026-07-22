import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  prompt: { type: String, required: true, trim: true },
  tag: { type: String, default: "Open court", trim: true },
  status: { type: String, enum: ["draft", "published", "locked"], default: "draft" },
  pinned: { type: Boolean, default: false },
  replyCount: { type: Number, default: 0, min: 0 },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityTopic", required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityComment", default: null },
  body: { type: String, required: true, trim: true, maxlength: 1500 },
  status: { type: String, enum: ["visible", "removed"], default: "visible" },
}, { timestamps: true });

export const CommunityTopic = mongoose.model("CommunityTopic", topicSchema);
export const CommunityComment = mongoose.model("CommunityComment", commentSchema);
