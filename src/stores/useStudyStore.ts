import { create } from "zustand";
import { Subject, StudyLog } from "@/types";

interface StudyStore {
  // --- Subjects ---
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;

  // --- Today's Log (Optimistic UI & Form State) ---
  // Key is subjectId, Value is the log entry in progress
  todayLogs: Record<string, Partial<StudyLog>>;
  updateTodayLog: (subjectId: string, data: Partial<StudyLog>) => void;
  clearTodayLogs: () => void;

  // --- UI State ---
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  
  activeDate: string; // YYYY-MM-DD
  setActiveDate: (date: string) => void;
}

const getTodayDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

export const useStudyStore = create<StudyStore>((set) => ({
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),

  todayLogs: {},
  updateTodayLog: (subjectId, data) =>
    set((state) => ({
      todayLogs: {
        ...state.todayLogs,
        [subjectId]: {
          ...state.todayLogs[subjectId],
          ...data,
        },
      },
    })),
  clearTodayLogs: () => set({ todayLogs: {} }),

  sidebarOpen: false, // Default closed on mobile, layout will override for desktop
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  sidebarCollapsed: false,
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  activeDate: getTodayDate(),
  setActiveDate: (date) => set({ activeDate: date }),
}));
