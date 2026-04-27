import mongoose, { Schema, Model } from "mongoose";
import { Achievement } from "@/types";

const AchievementSchema = new Schema<Achievement>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  type: { type: String }, // "streak_7", "hours_100", "subject_master"
  label: { type: String },
  earnedAt: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

export default (mongoose.models.Achievement as Model<Achievement>) || mongoose.model<Achievement>("Achievement", AchievementSchema);
