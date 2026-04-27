"use client";

import { format, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapItem {
  date: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: HeatmapItem[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Helper to get color intensity based on study hours
  const getColor = (value: number) => {
    if (value === 0) return "bg-surface-elevated";
    if (value < 2) return "bg-primary/20";
    if (value < 4) return "bg-primary/40";
    if (value < 6) return "bg-primary/60";
    if (value < 8) return "bg-primary/80";
    return "bg-primary";
  };

  // Calculate summary stats
  const totalHours = data.reduce((acc, curr) => acc + curr.value, 0);
  const activeDays = data.filter(d => d.value > 0).length;
  const maxHours = Math.max(...data.map(d => d.value), 0);
  const avgHours = activeDays > 0 ? (totalHours / activeDays).toFixed(1) : 0;
  
  return (
    <div className="space-y-4">
      {/* Stats Header Area (Top Right context) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div className="text-xs text-text-muted">
          Showing activity for the last 180 days
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Active Days</p>
            <p className="text-lg font-bold text-primary">{activeDays}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Avg/Day</p>
            <p className="text-lg font-bold text-primary">{avgHours}<span className="text-[10px] ml-0.5">h</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Max Day</p>
            <p className="text-lg font-bold text-primary">{maxHours}<span className="text-[10px] ml-0.5">h</span></p>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <div className="flex flex-wrap gap-1.5 min-w-[600px]">
          {data.map((item) => (
            <Tooltip key={item.date}>
              <TooltipTrigger render={(props) => (
                <div
                  {...props}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50 ${getColor(item.value)}`}
                />
              )} />
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{item.value} hours</p>
                  <p className="text-xs opacity-70">{format(parseISO(item.date), "MMM d, yyyy")}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface-elevated" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
