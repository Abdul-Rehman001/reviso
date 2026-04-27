"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Download, 
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useStudyStore } from "@/stores/useStudyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { HistorySkeleton } from "@/components/ui/page-skeletons";

interface StudyHistoryLog {
  _id: string;
  date: string;
  subjectId: {
    _id: string;
    name: string;
    emoji: string;
  };
  hoursStudied: number;
  topicsStudied: Array<{ title: string }>;
  notes: string;
}

export default function HistoryPage() {
  const { subjects, setSubjects } = useStudyStore();
  const [logs, setLogs] = useState<StudyHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Ensure subjects are loaded
        if (subjects.length === 0) {
          const subRes = await fetch("/api/subjects");
          const subJson = await subRes.json();
          if (subJson.success) setSubjects(subJson.data);
        }

        const res = await fetch("/api/logs/history");
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjects.length, setSubjects]);

  const filteredLogs = logs.filter(log => {
    const matchesSubject = subjectFilter === "all" || log.subjectId._id === subjectFilter;
    const matchesSearch = searchQuery === "" || 
      (log.notes?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.subjectId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.topicsStudied?.some((t: { title: string }) => t.title.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSubject && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["Date", "Subject", "Hours", "Topics", "Notes"];
    const rows = filteredLogs.map(log => [
      log.date,
      log.subjectId.name,
      log.hoursStudied,
      log.topicsStudied?.map((t: { title: string }) => t.title).join("; ") || "",
      log.notes || ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `study_history_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <HistorySkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-text-muted">Review your past study sessions and notes.</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-surface-elevated">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Search notes or topics..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <CustomSelect
              options={[
                { value: "all", label: "All Subjects" },
                ...subjects.map(sub => ({
                  value: sub._id as string,
                  label: `${sub.emoji} ${sub.name}`
                }))
              ]}
              value={subjectFilter}
              onChange={setSubjectFilter}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-surface border-dashed">
            <CalendarIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No logs found</h3>
            <p className="text-text-muted">Try adjusting your filters or log some hours first.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log._id} className="overflow-hidden hover:shadow-sm transition-shadow">
              <div 
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface flex flex-col items-center justify-center border shrink-0">
                    <span className="text-xs font-bold text-text-muted uppercase">{format(new Date(log.date), "MMM")}</span>
                    <span className="text-lg font-bold leading-none">{format(new Date(log.date), "dd")}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{log.subjectId.emoji}</span>
                      <h4 className="font-semibold">{log.subjectId.name}</h4>
                      <Badge variant="outline" className="bg-accent-subtle/30 text-xs py-0 h-5">
                        {log.hoursStudied} hrs
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {log.topicsStudied?.slice(0, 3).map((t: { title: string }, i: number) => (
                        <span key={i} className="text-[10px] bg-accent-muted/20 text-text-secondary px-1.5 rounded border border-accent-muted/30">
                          {t.title}
                        </span>
                      ))}
                      {log.topicsStudied?.length > 3 && (
                        <span className="text-[10px] text-text-muted">+{log.topicsStudied.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                  <p className="text-sm text-text-muted line-clamp-1 max-w-[200px] sm:max-w-[300px] italic">
                    {log.notes || "No notes"}
                  </p>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {expandedId === log._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {expandedId === log._id && (
                <div className="px-4 pb-4 pt-0 border-t bg-surface/30">
                  <div className="mt-4 space-y-4">
                    {log.topicsStudied?.length > 0 && (
                      <div>
                        <Label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">Topics Covered</Label>
                        <div className="flex flex-wrap gap-2">
                          {log.topicsStudied.map((t: { title: string }, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-surface border">{t.title}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-text-muted block mb-2 uppercase tracking-wider">Notes</Label>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {log.notes || "No additional notes for this session."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Minimal Label component since it's used here
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={className}>{children}</span>;
}
