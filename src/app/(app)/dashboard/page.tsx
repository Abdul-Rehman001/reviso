"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Flame, 
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { CustomSelect } from "@/components/ui/custom-select";
import { CustomPopover } from "@/components/ui/custom-popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/page-skeletons";

interface AnalyticsData {
  stats: {
    todayHours: number;
    periodHours: number;
    totalHours: number;
    streak: number;
  };
  chartData: Array<{ name: string; hours: number }>;
  subjectBreakdown: Array<{ name: string; hours: number; color: string }>;
  heatmapData: Array<{ date: string; value: number }>;
}

type CalendarSelection = Date | { from?: Date; to?: Date };

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("week");
  const [customRange, setCustomRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `/api/analytics?range=${range}`;
      if (range === "custom") {
        url += `&startDate=${format(customRange.from, "yyyy-MM-dd")}&endDate=${format(customRange.to, "yyyy-MM-dd")}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setIsLoading(false);
    }
  }, [range, customRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats || { todayHours: 0, periodHours: 0, totalHours: 0, streak: 0 };
  
  const rangeLabels: Record<string, string> = {
    today: "Today's Total",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    custom: "Custom Range"
  };

  const rangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-text-muted">Welcome back! Here&apos;s your study progress.</p>
        </div>
        <div className="flex items-center gap-2">
          {range === "custom" && (
            <CustomPopover
              trigger={
                <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 bg-primary/5 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                  {format(customRange.from, "MMM d")} - {format(customRange.to, "MMM d")}
                </Button>
              }
            >
              <div className="p-2 space-y-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Select Date Range</p>
                  <div className="flex gap-2">
                     <Calendar
                        mode="range"
                        selected={{ from: customRange.from, to: customRange.to }}
                        onSelect={(selected: CalendarSelection | undefined) => {
                          if (selected instanceof Date) return;
                          if (selected?.from && selected?.to) {
                            setCustomRange({ from: selected.from, to: selected.to });
                          }
                        }}
                        className="rounded-md border shadow"
                      />
                  </div>
                </div>
              </div>
            </CustomPopover>
          )}
          <CustomSelect 
            options={rangeOptions}
            value={range}
            onChange={setRange}
            className="w-[160px]"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Today&apos;s Study</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayHours} hrs</div>
            <p className="text-xs text-text-muted">Updated {format(new Date(), "p")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">{rangeLabels[range] || "Period Total"}</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.periodHours} hrs</div>
            <p className="text-xs text-text-muted">
              {range === "custom" 
                ? `${format(customRange.from, "MMM d")} to ${format(customRange.to, "MMM d")}`
                : "Filtered progress"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-text-muted">Keep the fire burning!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Studied</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours} hrs</div>
            <p className="text-xs text-text-muted">All-time progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{rangeLabels[range]} Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--accent-subtle))'}}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--surface-elevated))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {data?.subjectBreakdown && data.subjectBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.subjectBreakdown}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="hours"
                  >
                    {data.subjectBreakdown.map((entry: { color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--surface-elevated))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-2">
                <BookOpen className="h-8 w-8 text-text-muted mx-auto" />
                <p className="text-sm text-text-muted">No subject data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Map */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Map</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.heatmapData ? (
            <ActivityHeatmap data={data.heatmapData} />
          ) : (
            <div className="flex gap-1 animate-pulse">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-sm bg-surface-elevated" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
