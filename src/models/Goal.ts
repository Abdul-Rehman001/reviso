import mongoose, { Schema, Model } from "mongoose";
import { Goal } from "@/types";

const GoalSchema = new Schema<Goal>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject" }, // null = overall goal
  type: { type: String, enum: ["daily", "weekly", "monthly", "total"] },
  targetHours: { type: Number, required: true },
  period: { type: String }, // "2025-W18" for weekly, "2025-04" for monthly
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models.Goal as Model<Goal>) || mongoose.model<Goal>("Goal", GoalSchema);
