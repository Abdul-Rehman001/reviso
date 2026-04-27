import mongoose, { Schema, Model } from "mongoose";
import { User } from "@/types";

const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed, null if OAuth
  image: { type: String }, // avatar URL
  provider: { type: String, default: "credentials" }, // or "google"
  timezone: { type: String, default: "Asia/Kolkata" },
  preferences: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    weekStartDay: { type: Number, default: 1 }, // 0=Sun, 1=Mon
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default (mongoose.models.User as Model<User>) || mongoose.model<User>("User", UserSchema);
