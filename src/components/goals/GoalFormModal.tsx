/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStudyStore } from "@/stores/useStudyStore";
import { goalSchema } from "@/lib/validations";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: any) => void;
}

export function GoalFormModal({ isOpen, onClose, onSave }: GoalFormModalProps) {
  const { subjects } = useStudyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: "weekly",
      targetHours: 10,
      subjectId: null,
    },
  });

  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save goal");
      }

      onSave(json.data);
      toast.success("Study goal set successfully!");
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to save goal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set New Study Goal</DialogTitle>
          <DialogDescription>
            Choose a target and time period to track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select 
              defaultValue="weekly" 
              onValueChange={(val: any) => setValue("type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="total">Total (Overall)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject (Optional)</Label>
            <Select 
              onValueChange={(val) => setValue("subjectId", (val === "all" ? null : val) as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(sub => (
                  <SelectItem key={sub._id as string} value={sub._id as string}>
                    {sub.emoji} {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetHours">Target Hours</Label>
            <Input
              id="targetHours"
              type="number"
              step="0.5"
              {...register("targetHours", { valueAsNumber: true })}
            />
            {errors.targetHours && <p className="text-xs text-destructive">{errors.targetHours.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
