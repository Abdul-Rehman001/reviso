"use client";

import { useEffect, useState } from "react";
import { Plus, Target, Trash2, Trophy, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { useStudyStore } from "@/stores/useStudyStore";
import { Loader } from "@/components/ui/loader";
import { useCallback } from "react";

interface Goal {
  _id: string;
  type: "daily" | "weekly" | "monthly" | "overall";
  subjectId?: {
    _id: string;
    name: string;
    emoji: string;
  };
  targetHours: number;
  currentHours: number;
  progress: number;
}

export default function GoalsPage() {
  const { subjects, setSubjects } = useStudyStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/goals");
      const json = await res.json();
      if (json.success) {
        setGoals(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch goals", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (subjects.length === 0) {
        const subRes = await fetch("/api/subjects");
        const subJson = await subRes.json();
        if (subJson.success) setSubjects(subJson.data);
      }
      fetchGoals();
    };
    init();
  }, [fetchGoals, setSubjects, subjects.length]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGoals(goals.filter(g => g._id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Reviewing your goals..." className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals & Progress</h1>
          <p className="text-text-muted">Stay motivated by setting and reaching targets.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Active Goals Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Active Goals</h2>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-surface border-dashed">
            <p className="text-text-muted mb-4">No active goals. Set your first goal to track progress!</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create Goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <Card key={goal._id} className="relative group overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-text-muted mb-1 capitalize">
                        <span>{goal.type} Goal</span>
                        {goal.subjectId && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {goal.subjectId.emoji} {goal.subjectId.name}
                            </span>
                          </>
                        )}
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {goal.currentHours} / {goal.targetHours} <span className="text-sm font-normal text-text-muted">hrs</span>
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(goal._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs font-medium">
                      <span className={goal.progress >= 100 ? "text-success" : "text-primary"}>
                        {goal.progress}% Complete
                      </span>
                      <span className="text-text-muted">
                        {Math.max(0, goal.targetHours - goal.currentHours)} hrs remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Achievements Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-warning" />
          <h2 className="text-xl font-bold">Achievements</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AchievementBadge icon={<Zap />} label="First Log" unlocked />
          <AchievementBadge icon={<Award />} label="7 Day Streak" />
          <AchievementBadge icon={<Trophy />} label="100 Hours" />
          <AchievementBadge icon={<Target />} label="Goal Getter" />
          <AchievementBadge icon={<Flame />} label="Study Master" />
        </div>
      </section>

      <GoalFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => {
          fetchGoals(); // Re-fetch to get calculated progress
        }}
      />
    </div>
  );
}

function AchievementBadge({ icon, label, unlocked = false }: { icon: React.ReactNode, label: string, unlocked?: boolean }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${unlocked ? "bg-surface-elevated shadow-sm border-warning/30" : "bg-surface/50 opacity-40 grayscale"}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${unlocked ? "bg-warning/10 text-warning" : "bg-accent-subtle text-text-muted"}`}>
        {icon}
      </div>
      <span className="text-xs font-bold">{label}</span>
      {!unlocked && <span className="text-[10px] text-text-muted mt-1 uppercase">Locked</span>}
    </div>
  );
}

function Flame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.236 1.1-3.173.226-.316.516-.621.841-.913l.059-.054a10.457 10.457 0 0 1 1.7-1.36c.5-.34 1-.6 1.3-.9.3.3.6.6 1.3.9" />
    </svg>
  );
}
