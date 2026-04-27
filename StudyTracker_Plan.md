# StudyTracker — Full Stack Technical Plan
> Next.js 14 · TypeScript · MongoDB · Tailwind CSS · shadcn/ui

---

## 1. DESIGN SYSTEM & COLOR SCHEME

### Color Tokens

```css
/* Light Mode */
--background:        #FFFFFF
--surface:           #F8FAF8     /* subtle green-tinted white */
--surface-elevated:  #FFFFFF
--border:            #E4EDE4     /* soft green border */
--text-primary:      #0D1A0D     /* near-black */
--text-secondary:    #4A5C4A
--text-muted:        #8A9E8A
--accent:            #22C55E     /* green-500 */
--accent-hover:      #16A34A     /* green-600 */
--accent-subtle:     #DCFCE7     /* green-100 */
--accent-muted:      #BBF7D0     /* green-200 */
--destructive:       #EF4444
--warning:           #F59E0B
--success:           #22C55E

/* Dark Mode */
--background:        #0A0F0A
--surface:           #111811
--surface-elevated:  #182018
--border:            #1F2E1F
--text-primary:      #F0FBF0
--text-secondary:    #A8C4A8
--text-muted:        #5A7A5A
--accent:            #22C55E
--accent-hover:      #4ADE80
--accent-subtle:     #052E16
--accent-muted:      #14532D
```

### Typography

```
Display / Headings  →  "Geist" (Next.js native, modern, clean)
Body Text           →  "Geist" (same family, consistent)
Monospace / Times   →  "Geist Mono" (for hours, stats, numbers)
```

### Spacing Scale (Tailwind)
- Base unit: 4px
- Use: 2, 4, 6, 8, 12, 16, 24, 32, 48 consistently
- Cards: p-6 (24px), gap-4 (16px) between cards

### Component Patterns
- Cards: rounded-xl, border, bg-surface, shadow-sm
- Buttons: rounded-lg, h-9 (sm), h-10 (default), h-11 (lg)
- Inputs: rounded-lg, border, focus:ring-2 ring-accent/30
- Badges: rounded-full, px-2.5 py-0.5, text-xs
- Sidebar: w-64, fixed, border-r

### Subject Color Palette (user picks one per subject)
```
Emerald   #10B981    Rose      #F43F5E
Blue      #3B82F6    Amber     #F59E0B
Purple    #8B5CF6    Orange    #F97316
Cyan      #06B6D4    Pink      #EC4899
```

---

## 2. FRONTEND PLAN

### Tech Stack
| Tool | Purpose |
|------|----------|
| Next.js 14 (App Router) | Framework, routing, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Utility styling |
| shadcn/ui | Base components (Dialog, Dropdown, etc.) |
| Recharts | Charts on dashboard |
| React Hook Form + Zod | Forms + validation |
| Zustand | Client-side state |
| NextAuth.js | Authentication |
| date-fns | Date formatting/manipulation |
| Framer Motion | Subtle animations |
| next-themes | Dark/light mode toggle |
| Lucide React | Icons |

---

### Pages & Routing

```
app/
├── (auth)/
│   ├── login/page.tsx              → Login page
│   └── register/page.tsx           → Register page
│
├── (app)/                          → Protected layout with sidebar
│   ├── layout.tsx                  → Sidebar + topbar wrapper
│   ├── dashboard/page.tsx          → Main dashboard
│   ├── log/page.tsx                → Today's study log
│   ├── subjects/
│   │   ├── page.tsx                → All subjects list
│   │   └── [id]/page.tsx           → Subject detail + topics
│   ├── history/
│   │   ├── page.tsx                → History browser
│   │   └── [date]/page.tsx         → Single day review
│   ├── goals/page.tsx              → Goals & targets
│   └── settings/page.tsx           → Profile, preferences
│
└── api/                            → API Routes (see Backend section)
```

---

### Page-by-Page Feature Breakdown

#### `/dashboard`
- **Header**: "Good morning, [name]" + today's date + streak badge
- **Stats Row** (4 cards): Today's Hours | Week Total | Active Subjects | Current Streak
- **Weekly Bar Chart**: Hours per subject stacked, per day (Mon–Sun)
- **Subject Progress**: Progress bars per subject (actual vs target hours this week)
- **Monthly Heatmap**: GitHub-style contribution grid (intensity = hours studied)
- **Recent Notes**: Last 5 notes added across any subject
- **Quick Log CTA**: Button to jump to today's log

#### `/log` (Today's Study Log)
- **Date Header**: "Sunday, April 26" (bold, large)
- **Subject Cards**: One card per subject with:
  - Subject name + color dot
  - Hours input (number stepper, 0–12)
  - Notes textarea (short note on what was studied)
  - Topic tag input (add topic chips)
  - Expand button → inline topic list with past topics
- **Save Button**: Saves all subjects' logs for today in one shot
- **Today's Summary**: Live-updating total hours count at bottom

#### `/subjects`
- Grid of subject cards (name, color, total hours this month, topic count)
- "Add Subject" button → modal with name, color picker, daily target
- Edit / Delete per card (kebab menu)

#### `/subjects/[id]`
- Subject header (name, color, stats)
- **Tabs**: Overview | Topics | Notes | Analytics
- Overview: Recent logs for this subject, weekly trend chart
- Topics: List of all topics added, CRUD per topic
- Notes: All notes written for this subject, searchable
- Analytics: Subject-specific line chart (hours over time)

#### `/history`
- Month/week switcher at top
- Calendar grid view — each day shows total hours + subject color dots
- Click a day → expands inline or routes to `/history/[date]`
- Filter sidebar: by subject, by minimum hours, by has-notes

#### `/history/[date]`
- Full view of that day's log: all subjects, hours, notes, topics
- Read-only with "Edit" option if within 7 days

#### `/goals`
- Set weekly/daily hour targets per subject
- Visual goal tracker (donut charts per subject)
- Streak goals + milestone badges section

#### `/settings`
- Profile: name, email, avatar (initials fallback)
- Appearance: dark/light toggle, accent color (fixed green but shown)
- Subjects: Quick manage (same as /subjects)
- Data: Export as CSV/JSON, delete account

---

### State Management (Zustand)

```typescript
// stores/useStudyStore.ts
interface StudyStore {
  // Subjects
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void

  // Today's Log (in-progress, before save)
  todayLogs: Record<string, TodayLogEntry>  // subjectId → entry
  updateTodayLog: (subjectId: string, data: Partial<TodayLogEntry>) => void

  // UI State
  sidebarOpen: boolean
  toggleSidebar: () => void
  activeDate: string   // YYYY-MM-DD
  setActiveDate: (date: string) => void
}
```

### Key Shared Components

```
components/
├── layout/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── PageHeader.tsx
├── dashboard/
│   ├── StatsCard.tsx
│   ├── WeeklyBarChart.tsx
│   ├── MonthlyHeatmap.tsx
│   ├── SubjectProgressBar.tsx
│   └── RecentNotes.tsx
├── log/
│   ├── SubjectLogCard.tsx
│   ├── HoursInput.tsx
│   └── TopicChipInput.tsx
├── subjects/
│   ├── SubjectCard.tsx
│   ├── SubjectFormModal.tsx
│   └── ColorPicker.tsx
├── ui/
│   ├── Badge.tsx
│   ├── StreakBadge.tsx
│   └── EmptyState.tsx
└── charts/
    ├── BarChart.tsx
    ├── LineChart.tsx
    ├── DonutChart.tsx
    └── HeatmapGrid.tsx
```

---

## 3. BACKEND PLAN

### API Routes (Next.js App Router)

All routes are under `app/api/` and protected via NextAuth session middleware.

---

#### AUTH
```
POST   /api/auth/register          → Create new user
POST   /api/auth/[...nextauth]      → NextAuth handler (login, session, logout)
GET    /api/auth/session            → Current session
```

---

#### SUBJECTS
```
GET    /api/subjects                → Get all subjects for current user
POST   /api/subjects                → Create new subject
PUT    /api/subjects/[id]           → Update subject (name, color, target)
DELETE /api/subjects/[id]           → Delete subject (+ cascade logs)
```

Request body (POST/PUT):
```json
{
  "name": "Mathematics",
  "color": "#8B5CF6",
  "dailyTargetHours": 2,
  "weeklyTargetHours": 10
}
```

---

#### TOPICS (per subject)
```
GET    /api/subjects/[id]/topics    → Get all topics for a subject
POST   /api/subjects/[id]/topics    → Add a topic
PUT    /api/topics/[id]             → Update topic title/notes
DELETE /api/topics/[id]             → Delete topic
```

---

#### STUDY LOGS
```
GET    /api/logs                    → Get logs (query params below)
POST   /api/logs                    → Create/update log for a date+subject
PUT    /api/logs/[id]               → Update a specific log
DELETE /api/logs/[id]               → Delete a specific log
GET    /api/logs/today              → Shortcut: today's all-subject logs
GET    /api/logs/[date]             → All logs for a specific date
```

Query params for `GET /api/logs`:
```
?startDate=2025-04-01
&endDate=2025-04-30
&subjectId=xxx
&hasNotes=true
&limit=50
&page=1
```

Response:
```json
{
  "logs": [...],
  "pagination": { "total": 120, "page": 1, "limit": 50 }
}
```

---

#### DASHBOARD / ANALYTICS
```
GET    /api/analytics/summary       → Today stats, streak, week total
GET    /api/analytics/weekly        → Last 7 days breakdown by subject
GET    /api/analytics/monthly       → Monthly heatmap data
GET    /api/analytics/subjects      → Per-subject stats (all time)
GET    /api/analytics/streak        → Current + longest streak
```

Weekly response shape:
```json
{
  "days": [
    {
      "date": "2025-04-20",
      "dayLabel": "Sun",
      "totalHours": 4.5,
      "subjects": [
        { "subjectId": "...", "name": "Math", "color": "#8B5CF6", "hours": 2 },
        { "subjectId": "...", "name": "Physics", "color": "#3B82F6", "hours": 2.5 }
      ]
    }
  ]
}
```

---

#### GOALS
```
GET    /api/goals                   → Get all goals for user
POST   /api/goals                   → Create goal
PUT    /api/goals/[id]              → Update goal
DELETE /api/goals/[id]              → Delete goal
GET    /api/goals/progress          → Progress vs goals (this week/month)
```

---

#### NOTES SEARCH
```
GET    /api/notes/search?q=quantum  → Full-text search across all notes
```

---

#### EXPORT
```
GET    /api/export?format=csv       → Export all logs as CSV
GET    /api/export?format=json      → Export all data as JSON
```

---

### Middleware & Error Handling

```typescript
// middleware.ts — protect all /app routes
export { default } from "next-auth/middleware"
export const config = { matcher: ["/dashboard/:path*", "/log/:path*", ...] }

// Standard API response shape
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}

// Error shape
{
  "success": false,
  "error": "Validation failed",
  "details": [...]
}
```

---

## 4. DATABASE PLAN (MongoDB + Mongoose)

### Schema Design

---

#### User
```typescript
const UserSchema = new Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String },           // hashed, null if OAuth
  image:         { type: String },           // avatar URL
  provider:      { type: String, default: "credentials" },  // or "google"
  timezone:      { type: String, default: "Asia/Kolkata" },
  preferences: {
    theme:       { type: String, enum: ["light", "dark", "system"], default: "system" },
    weekStartDay:{ type: Number, default: 1 }, // 0=Sun, 1=Mon
  },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
})
```

---

#### Subject
```typescript
const SubjectSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name:          { type: String, required: true },
  color:         { type: String, required: true },   // hex color
  emoji:         { type: String },                   // optional emoji
  order:         { type: Number, default: 0 },       // for drag-to-reorder
  targets: {
    dailyHours:  { type: Number, default: 2 },
    weeklyHours: { type: Number, default: 10 },
  },
  isArchived:    { type: Boolean, default: false },
  totalHours:    { type: Number, default: 0 },       // denormalized for perf
  createdAt:     { type: Date, default: Date.now },
})

// Compound index: one user can't have two subjects with same name
SubjectSchema.index({ userId: 1, name: 1 }, { unique: true })
```

---

#### Topic
```typescript
const TopicSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
  subjectId:     { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  title:         { type: String, required: true },
  description:   { type: String },
  tags:          [{ type: String }],
  isCompleted:   { type: Boolean, default: false },
  completedAt:   { type: Date },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
})
```

---

#### StudyLog  ← CORE TABLE
```typescript
const StudyLogSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId:     { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  date:          { type: String, required: true },   // "YYYY-MM-DD" (user local date)
  hoursStudied:  { type: Number, required: true, min: 0, max: 24 },
  notes:         { type: String, maxlength: 1000 },  // short daily note
  topicsStudied: [{
    topicId:     { type: Schema.Types.ObjectId, ref: "Topic" },  // optional ref
    title:       { type: String, required: true },
    notes:       { type: String },
  }],
  mood:          { type: Number, min: 1, max: 5 },   // bonus: 1–5 mood rating
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
})

// CRITICAL index: one log per user per subject per date
StudyLogSchema.index({ userId: 1, subjectId: 1, date: 1 }, { unique: true })
// For fast date-range queries
StudyLogSchema.index({ userId: 1, date: 1 })
```

---

#### Goal
```typescript
const GoalSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId:     { type: Schema.Types.ObjectId, ref: "Subject" },  // null = overall goal
  type:          { type: String, enum: ["daily", "weekly", "monthly", "total"] },
  targetHours:   { type: Number, required: true },
  period:        { type: String },   // "2025-W18" for weekly, "2025-04" for monthly
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
})
```

---

#### Streak  (computed + cached)
```typescript
const StreakSchema = new Schema({
  userId:          { type: Schema.Types.ObjectId, ref: "User", unique: true },
  currentStreak:   { type: Number, default: 0 },
  longestStreak:   { type: Number, default: 0 },
  lastStudyDate:   { type: String },   // "YYYY-MM-DD"
  totalDaysStudied:{ type: Number, default: 0 },
  updatedAt:       { type: Date, default: Date.now },
})
```

---

#### Achievement / Badge  (bonus)
```typescript
const AchievementSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: "User", index: true },
  type:        { type: String },   // "streak_7", "hours_100", "subject_master"
  label:       { type: String },
  earnedAt:    { type: Date, default: Date.now },
  metadata:    { type: Schema.Types.Mixed },
})
```

---

### Database Indexes Summary

| Collection | Index | Type |
|------------|-------|------|
| users | email | unique |
| subjects | userId | regular |
| subjects | userId + name | compound unique |
| topics | subjectId | regular |
| studylogs | userId + subjectId + date | compound unique |
| studylogs | userId + date | compound |
| goals | userId | regular |
| streaks | userId | unique |

---

## 5. DATA FLOW (FE ↔ API ↔ DB)

```
User opens /log
  → GET /api/logs/today         (fetch today's existing entries)
  → GET /api/subjects           (fetch user's subjects)
  → Zustand: populate todayLogs state
  → User edits hours/notes
  → Zustand: updateTodayLog() (optimistic)
  → User hits Save
  → POST /api/logs (upsert each subject entry)
  → DB: StudyLog.findOneAndUpdate({ userId, subjectId, date }, ..., { upsert: true })
  → POST /api/analytics/streak  (recalculate streak server-side)
  → Zustand: mark saved, show success toast

User opens /dashboard
  → parallel: GET /api/analytics/summary
             GET /api/analytics/weekly
             GET /api/analytics/monthly
  → All three fire simultaneously (Promise.all)
  → Render charts with data
```

---

## 6. FOLDER STRUCTURE

```
study-tracker/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── log/page.tsx
│   │   ├── subjects/page.tsx
│   │   ├── subjects/[id]/page.tsx
│   │   ├── history/page.tsx
│   │   ├── history/[date]/page.tsx
│   │   ├── goals/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── subjects/route.ts
│       ├── subjects/[id]/route.ts
│       ├── subjects/[id]/topics/route.ts
│       ├── topics/[id]/route.ts
│       ├── logs/route.ts
│       ├── logs/today/route.ts
│       ├── logs/[date]/route.ts
│       ├── logs/[id]/route.ts
│       ├── analytics/summary/route.ts
│       ├── analytics/weekly/route.ts
│       ├── analytics/monthly/route.ts
│       ├── analytics/subjects/route.ts
│       ├── goals/route.ts
│       ├── goals/[id]/route.ts
│       ├── notes/search/route.ts
│       └── export/route.ts
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── log/
│   ├── subjects/
│   ├── charts/
│   └── ui/
├── lib/
│   ├── db.ts                  → MongoDB connection singleton
│   ├── auth.ts                → NextAuth config
│   ├── validations.ts         → Zod schemas
│   └── utils.ts               → Helpers (streak calc, date utils)
├── models/
│   ├── User.ts
│   ├── Subject.ts
│   ├── Topic.ts
│   ├── StudyLog.ts
│   ├── Goal.ts
│   ├── Streak.ts
│   └── Achievement.ts
├── stores/
│   └── useStudyStore.ts
├── types/
│   └── index.ts               → All shared TS interfaces
├── hooks/
│   ├── useSubjects.ts
│   ├── useLogs.ts
│   └── useAnalytics.ts
├── middleware.ts
├── tailwind.config.ts
└── .env.local
```

---

## 7. ENV VARIABLES

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=...           # if adding Google OAuth
GOOGLE_CLIENT_SECRET=...
```

---

## 8. ONE-DAY BUILD ORDER

```
Hour 1–2   → Project setup, Tailwind + shadcn, DB connection, auth
Hour 3     → Models (User, Subject, StudyLog, Topic, Goal, Streak)
Hour 4     → Subject CRUD API + frontend /subjects page
Hour 5     → Study Log API + /log page UI
Hour 6     → Analytics API (summary, weekly, monthly)
Hour 7     → Dashboard page with all charts
Hour 8     → History page + [date] detail
Hour 9     → Goals page + streak logic
Hour 10    → Settings + dark/light mode + polish
Hour 11    → Testing, edge cases, loading/error states
Hour 12    → Deploy to Vercel + MongoDB Atlas final check
```

---

*Everything above is synchronized: every frontend page has its API route, every API route has its DB schema with the right indexes, and every schema field maps to a real UI element.*
