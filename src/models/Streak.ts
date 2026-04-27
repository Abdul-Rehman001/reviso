import mongoose, { Schema, Model } from "mongoose";
import { Streak } from "@/types";

const StreakSchema = new Schema<Streak>({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: { type: String }, // "YYYY-MM-DD"
  totalDaysStudied: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default (mongoose.models.Streak as Model<Streak>) || mongoose.model<Streak>("Streak", StreakSchema);
