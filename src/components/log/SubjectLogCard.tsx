"use client";

import { Subject, StudyLog } from "@/types";
import { useStudyStore } from "@/stores/useStudyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Tag, CheckCircle2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface SubjectLogCardProps {
  subject: Subject;
  log?: Partial<StudyLog>;
  isSaved?: boolean;
}

export function SubjectLogCard({ subject, log, isSaved }: SubjectLogCardProps) {
  const { updateTodayLog, activeDate } = useStudyStore();
  const [topicInput, setTopicInput] = useState("");
  const [localHours, setLocalHours] = useState<string>(String(log?.hoursStudied || 0));

  const hours = log?.hoursStudied || 0;
  const notes = log?.notes || "";
  const topics = log?.topicsStudied || [];

  // Keep localHours in sync when log changes (e.g. from state)
  useEffect(() => {
    setLocalHours(String(hours));
  }, [hours]);

  const handleHoursChange = (delta: number) => {
    const newHours = Math.max(0, Math.min(24, hours + delta));
    updateTodayLog(subject._id as string, { 
      subjectId: subject._id,
      date: activeDate,
      hoursStudied: newHours 
    });
  };

  const handleDirectHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHours(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 24) {
      updateTodayLog(subject._id as string, {
        subjectId: subject._id,
        date: activeDate,
        hoursStudied: num
      });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTodayLog(subject._id as string, { 
      subjectId: subject._id,
      date: activeDate,
      notes: e.target.value 
    });
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      const newTopics = [...topics, { title: topicInput.trim() }];
      updateTodayLog(subject._id as string, {
        subjectId: subject._id,
        date: activeDate,
        topicsStudied: newTopics
      });
      setTopicInput("");
    }
  };

  const handleAddTopicKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  const removeTopic = (index: number) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    updateTodayLog(subject._id as string, {
      subjectId: subject._id,
      date: activeDate,
      topicsStudied: newTopics
    });
  };

  return (
    <Card className={`border-l-4 overflow-hidden transition-all duration-200 ${hours > 0 ? "shadow-md" : "opacity-80 hover:opacity-100"}`} style={{ borderLeftColor: subject.color }}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{subject.emoji}</span>
              <h3 className="font-semibold text-lg">{subject.name}</h3>
              {isSaved && hours > 0 && (
                <Badge variant="outline" className="ml-2 bg-success/10 text-success border-success/20 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-text-muted">Study Notes</Label>
              <Textarea 
                placeholder="What did you study today?" 
                className="resize-none h-20 bg-surface-elevated/50 focus:bg-surface-elevated transition-colors"
                value={notes}
                onChange={handleNotesChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-text-muted flex items-center gap-1">
                <Tag className="w-3 h-3" /> Topics Covered
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {topics.map((topic, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none">
                    {topic.title}
                    <button onClick={() => removeTopic(i)} className="hover:text-destructive text-primary/60 ml-1 transition-colors">
                      <PlusCircle className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Topic title (e.g. Linear Equations)" 
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleAddTopicKey}
                  onBlur={addTopic}
                  className="h-9 text-sm bg-surface-elevated/50"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-9">
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="sm:w-52 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-4 p-4 bg-surface rounded-xl border border-border/50">
            <div className="text-center sm:text-right w-full space-y-3">
              <Label className="text-xs text-text-muted block font-semibold uppercase tracking-wider">Hours Studied</Label>
              
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/10 transition-colors"
                  onClick={() => handleHoursChange(-0.5)}
                  disabled={hours <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <div className="relative w-20">
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={localHours}
                    onChange={handleDirectHoursChange}
                    className="text-center text-xl font-bold font-mono h-10 px-1 border-primary/30 focus:border-primary transition-all"
                  />
                  <span className="absolute -bottom-5 left-0 right-0 text-[10px] text-center text-text-muted font-medium">HOURS</span>
                </div>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  onClick={() => handleHoursChange(0.5)}
                  disabled={hours >= 24}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
