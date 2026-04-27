/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Subject } from "@/types";
import { subjectSchema } from "@/lib/validations";
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

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialData?: Subject | null;
}

const PRESET_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F43F5E", // Rose
  "#F59E0B", // Amber
  "#F97316", // Orange
  "#EC4899", // Pink
];

export function SubjectFormModal({ isOpen, onClose, onSave, initialData }: SubjectFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      color: PRESET_COLORS[0],
      emoji: "📚",
      targets: {
        dailyHours: 2,
        weeklyHours: 10,
      },
    },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("color", initialData.color);
        setValue("emoji", initialData.emoji || "📚");
        setValue("targets.dailyHours", initialData.targets?.dailyHours || 2);
        setValue("targets.weeklyHours", initialData.targets?.weeklyHours || 10);
      } else {
        reset();
      }
    }
  }, [isOpen, initialData, setValue, reset]);

  const onSubmit = async (data: SubjectFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = initialData ? `/api/subjects/${initialData._id}` : "/api/subjects";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save subject");
      }

      onSave(json.data);
      toast.success(initialData ? "Subject updated successfully" : "Subject created successfully");
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to save subject");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogDescription>
            Configure your subject details and weekly study targets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input id="name" placeholder="Mathematics" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input id="emoji" placeholder="📐" {...register("emoji")} className="text-center text-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === color ? "border-primary scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyHours">Daily Target (hrs)</Label>
              <Input
                id="dailyHours"
                type="number"
                step="0.5"
                {...register("targets.dailyHours", { valueAsNumber: true })}
              />
              {errors.targets?.dailyHours && <p className="text-xs text-destructive">{errors.targets.dailyHours.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyHours">Weekly Target (hrs)</Label>
              <Input
                id="weeklyHours"
                type="number"
                step="1"
                {...register("targets.weeklyHours", { valueAsNumber: true })}
              />
              {errors.targets?.weeklyHours && <p className="text-xs text-destructive">{errors.targets.weeklyHours.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
