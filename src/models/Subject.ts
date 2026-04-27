import mongoose, { Schema, Model } from "mongoose";
import { Subject } from "@/types";

const SubjectSchema = new Schema<Subject>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  color: { type: String, required: true }, // hex color
  emoji: { type: String }, // optional emoji
  order: { type: Number, default: 0 }, // for drag-to-reorder
  targets: {
    dailyHours: { type: Number, default: 2 },
    weeklyHours: { type: Number, default: 10 },
  },
  isArchived: { type: Boolean, default: false },
  totalHours: { type: Number, default: 0 }, // denormalized for perf
  createdAt: { type: Date, default: Date.now },
});

// Compound index: one user can't have two subjects with same name
SubjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default (mongoose.models.Subject as Model<Subject>) || mongoose.model<Subject>("Subject", SubjectSchema);
