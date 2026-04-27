import { z } from "zod";

// --- AUTH VALIDATION ---
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- SUBJECT VALIDATION ---
export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color"),
  emoji: z.string().optional(),
  targets: z.object({
    dailyHours: z.number().min(0).max(24),
    weeklyHours: z.number().min(0).max(168),
  }),
});

// --- TOPIC VALIDATION ---
export const topicSchema = z.object({
  title: z.string().min(1, "Topic title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// --- STUDY LOG VALIDATION ---
export const studyLogSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  hoursStudied: z.number().min(0).max(24, "Cannot study more than 24 hours in a day"),
  notes: z.string().max(1000).optional(),
  topicsStudied: z.array(z.object({
    topicId: z.string().optional(),
    title: z.string().min(1, "Topic title is required"),
    notes: z.string().optional(),
  })).default([]),
  mood: z.number().min(1).max(5).optional(),
});

// --- GOAL VALIDATION ---
export const goalSchema = z.object({
  subjectId: z.string().optional().nullable(),
  type: z.enum(["daily", "weekly", "monthly", "total"]),
  targetHours: z.number().min(0.1),
  period: z.string().optional(),
});
