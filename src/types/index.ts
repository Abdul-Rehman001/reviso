import { Types } from "mongoose";

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Base Types for NextAuth ---
export interface UserSession {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// --- Database Models ---

export interface User {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  password?: string | null;
  image?: string;
  provider: "credentials" | "google";
  timezone: string;
  preferences: {
    theme: "light" | "dark" | "system";
    weekStartDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  name: string;
  color: string;
  emoji?: string;
  order: number;
  targets: {
    dailyHours: number;
    weeklyHours: number;
  };
  isArchived: boolean;
  totalHours: number;
  createdAt: Date;
}

export interface Topic {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  subjectId: Types.ObjectId | string | Subject;
  title: string;
  description?: string;
  tags: string[];
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyLogTopic {
  topicId?: Types.ObjectId | string | Topic;
  title: string;
  notes?: string;
}

export interface StudyLog {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  subjectId: Types.ObjectId | string | Subject;
  date: string; // "YYYY-MM-DD"
  hoursStudied: number;
  notes?: string;
  topicsStudied: StudyLogTopic[];
  mood?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  subjectId?: Types.ObjectId | string | Subject | null;
  type: "daily" | "weekly" | "monthly" | "total";
  targetHours: number;
  period?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Streak {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
  totalDaysStudied: number;
  updatedAt: Date;
}

export interface Achievement {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | User;
  type: string;
  label: string;
  earnedAt: Date;
  metadata?: Record<string, unknown>;
}
