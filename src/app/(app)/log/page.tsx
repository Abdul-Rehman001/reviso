"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Save, CheckCircle2 } from "lucide-react";
import { useStudyStore } from "@/stores/useStudyStore";
import { Button } from "@/components/ui/button";
import { SubjectLogCard } from "@/components/log/SubjectLogCard";
import Link from "next/link";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { subDays, addDays, isToday } from "date-fns";
import { toast } from "sonner";
import { CustomPopover } from "@/components/ui/custom-popover";
import { LogSkeleton } from "@/components/ui/page-skeletons";

interface StudyLog {
  subjectId: string;
  date: string;
  hoursStudied: number;
  notes: string;
  topicsStudied: Array<{ title: string }>;
}

export default function LogPage() {
  const { subjects, setSubjects, todayLogs, activeDate, setActiveDate } = useStudyStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Clear current todayLogs before fetching new ones for the selected date
        useStudyStore.setState({ todayLogs: {} });
        // Fetch subjects
        const subRes = await fetch("/api/subjects");
        const subJson = await subRes.json();
        if (subJson.success) {
          setSubjects(subJson.data);
        }

        // Fetch today's logs to pre-fill the state
        const logRes = await fetch(`/api/logs/today?date=${activeDate}`);
        const logJson = await logRes.json();
        
        if (logJson.success && logJson.data.length > 0) {
          // Pre-populate Zustand state
          const prefilledLogs: Record<string, StudyLog> = {};
          
          logJson.data.forEach((log: StudyLog) => {
            prefilledLogs[log.subjectId] = {
              subjectId: log.subjectId,
              date: log.date,
              hoursStudied: log.hoursStudied,
              notes: log.notes || "",
              topicsStudied: log.topicsStudied || []
            };
          });
          
          useStudyStore.setState({ todayLogs: prefilledLogs });
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeDate, setSubjects]);

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      setSaved(false);

      const logsToSave = Object.values(todayLogs)
        .filter((log) => 
          (log.hoursStudied !== undefined && log.hoursStudied > 0) || 
          (log.notes && log.notes.length > 0) || 
          (log.topicsStudied && log.topicsStudied.length > 0)
        )
        .map(log => ({
          ...log,
          hoursStudied: log.hoursStudied ?? 0,
          notes: log.notes ?? "",
          topicsStudied: log.topicsStudied ?? [],
        }));

      if (logsToSave.length === 0) {
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logsToSave),
      });

      if (res.ok) {
        setSaved(true);
        toast.success("Logs saved successfully");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error("Failed to save logs");
      }
    } catch (error) {
      console.error("Failed to save logs", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setActiveDate(format(date, "yyyy-MM-dd"));
    }
  };

  const navigateDate = (days: number) => {
    const currentDate = new Date(activeDate);
    const newDate = days > 0 ? addDays(currentDate, days) : subDays(currentDate, Math.abs(days));
    setActiveDate(format(newDate, "yyyy-MM-dd"));
  };

  // Calculate total hours for today
  const totalHours = Object.values(todayLogs).reduce((acc, log) => acc + (log.hoursStudied || 0), 0);

  const displayDate = new Date(activeDate);

  if (isLoading) {
    return <LogSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b">
        <div className="space-y-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CustomPopover
              trigger={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal h-9",
                    !activeDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activeDate ? format(displayDate, "PPP") : <span>Pick a date</span>}
                </Button>
              }
            >
              <Calendar
                mode="single"
                selected={displayDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </CustomPopover>

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {!isToday(displayDate) && (
              <Button variant="link" size="sm" className="text-xs h-8" onClick={() => setActiveDate(format(new Date(), "yyyy-MM-dd"))}>
                Go to Today
              </Button>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {isToday(displayDate) ? "Today's Log" : format(displayDate, "EEEE, MMMM do")}
            </h1>
          </div>
        </div>
        <div className="bg-surface-elevated px-4 py-2 rounded-xl border shadow-sm">
          <span className="text-text-muted text-sm mr-2">Total Hours:</span>
          <span className="text-2xl font-bold text-primary">{totalHours}</span>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16 px-4 border rounded-xl bg-surface border-dashed">
          <h3 className="text-lg font-medium text-foreground mb-2">No subjects to log</h3>
          <p className="text-text-muted mb-4 max-w-md mx-auto">
            You need to create at least one subject before you can log your study hours.
          </p>
          <Link href="/subjects">
            <Button>Go to Subjects</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => (
            <SubjectLogCard 
              key={subject._id as string} 
              subject={subject} 
              log={todayLogs[subject._id as string]} 
              isSaved={saved}
            />
          ))}
        </div>
      )}

      {/* Floating Save Bar */}
      {subjects.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-surface-elevated/80 backdrop-blur-md border-t flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <span className="font-medium text-text-secondary hidden sm:inline-block">
              {Object.keys(todayLogs).length > 0 ? "Unsaved changes" : "All caught up"}
            </span>
          </div>
          <Button 
            size="lg" 
            onClick={handleSaveAll} 
            disabled={isSaving || Object.keys(todayLogs).length === 0}
            className={`transition-all ${saved ? "bg-success text-white hover:bg-success" : ""}`}
          >
            {isSaving ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" /> Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Save Today&apos;s Log
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
