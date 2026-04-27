import mongoose, { Schema, Model } from "mongoose";
import { StudyLog } from "@/types";

const StudyLogSchema = new Schema<StudyLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" (user local date)
  hoursStudied: { type: Number, required: true, min: 0, max: 24 },
  notes: { type: String, maxlength: 1000 }, // short daily note
  topicsStudied: [{
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" }, // optional ref
    title: { type: String, required: true },
    notes: { type: String },
  }],
  mood: { type: Number, min: 1, max: 5 }, // bonus: 1–5 mood rating
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// CRITICAL index: one log per user per subject per date
StudyLogSchema.index({ userId: 1, subjectId: 1, date: 1 }, { unique: true });
// For fast date-range queries
StudyLogSchema.index({ userId: 1, date: 1 });

export default (mongoose.models.StudyLog as Model<StudyLog>) || mongoose.model<StudyLog>("StudyLog", StudyLogSchema);
