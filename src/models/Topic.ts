import mongoose, { Schema, Model } from "mongoose";
import { Topic } from "@/types";

const TopicSchema = new Schema<Topic>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default (mongoose.models.Topic as Model<Topic>) || mongoose.model<Topic>("Topic", TopicSchema);
