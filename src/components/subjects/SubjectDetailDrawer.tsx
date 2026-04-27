/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  Target, 
  BookOpen, 
  Calendar,

  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { Subject } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectDetailDrawerProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubjectDetailDrawer({ subject, isOpen, onClose }: SubjectDetailDrawerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && subject?._id) {
      const fetchLogs = async () => {
        try {
          setIsLoading(true);
          const res = await fetch(`/api/logs/history?subjectId=${subject._id}`);
          const json = await res.json();
          if (json.success) {
            setLogs(json.data);
          }
        } catch (err) {
          console.error("Failed to fetch subject logs", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLogs();
    }
  }, [isOpen, subject?._id]);

  if (!subject) return null;

  // Extract unique topics
  const allTopics = Array.from(new Set(
    logs.flatMap(log => log.topicsStudied?.map((t: any) => t.title) || [])
  ));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l">
        {/* Header Section */}
        <div className="p-6 pb-4 border-b space-y-4" style={{ borderTop: `6px solid ${subject.color}` }}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{subject.emoji}</span>
                <SheetTitle className="text-2xl font-bold">{subject.name}</SheetTitle>
              </div>
              <SheetDescription>Overview of your progress and notes.</SheetDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-surface border">
              <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Total Studied
              </p>
              <p className="text-xl font-bold font-mono">{subject.totalHours || 0} <span className="text-sm font-normal text-text-muted">hrs</span></p>
            </div>
            <div className="p-3 rounded-xl bg-surface border">
              <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Weekly Target
              </p>
              <p className="text-xl font-bold font-mono">{subject.targets.weeklyHours} <span className="text-sm font-normal text-text-muted">hrs</span></p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Progress Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Weekly Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Status</span>
                  <span className="font-medium">{Math.min(100, Math.round(((subject.totalHours || 0) / subject.targets.weeklyHours) * 100))}%</span>
                </div>
                <Progress value={((subject.totalHours || 0) / subject.targets.weeklyHours) * 100} className="h-2" />
              </div>
            </section>

            {/* Topics Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Topics Covered
              </h3>
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
                </div>
              ) : allTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((topic: any, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 bg-surface border hover:bg-accent-subtle transition-colors">
                      {topic}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No topics logged yet.</p>
              )}
            </section>

            {/* Recent Notes Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Recent Notes
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="p-4 rounded-xl bg-surface border space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary">{format(new Date(log.date), "MMM dd, yyyy")}</span>
                        <span className="text-xs text-text-muted">{log.hoursStudied} hrs</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {log.notes || "No notes for this session."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No session notes found.</p>
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
