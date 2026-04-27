import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudyLog from "@/models/StudyLog";
import Subject from "@/models/Subject";
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  parseISO
} from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "week";
    
    await dbConnect();

    let startDate: Date;
    let endDate: Date = new Date();
    let chartData: Array<{ name: string; hours: number }> = [];

    // Define date ranges
    if (range === "today") {
      startDate = new Date();
      endDate = new Date();
    } else if (range === "month") {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else if (range === "year") {
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
    } else if (range === "custom") {
      const startParam = searchParams.get("startDate");
      const endParam = searchParams.get("endDate");
      startDate = startParam ? parseISO(startParam) : subDays(new Date(), 7);
      endDate = endParam ? parseISO(endParam) : new Date();
    } else {
      // Default to week
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
    }

    const logsInRange = await StudyLog.find({
      userId,
      date: { $gte: format(startDate, "yyyy-MM-dd"), $lte: format(endDate, "yyyy-MM-dd") }
    });

    // Stats
    const today = format(new Date(), "yyyy-MM-dd");
    const todayHours = (await StudyLog.find({ userId, date: today }))
      .reduce((acc, log) => acc + log.hoursStudied, 0);

    const periodHours = logsInRange.reduce((acc, log) => acc + log.hoursStudied, 0);
    
    const allLogs = await StudyLog.find({ userId });
    const totalHours = allLogs.reduce((acc, log) => acc + log.hoursStudied, 0);

    // Chart Data Generation
    if (range === "year") {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      chartData = months.map(m => {
        const mStr = format(m, "MMM");
        const mHours = logsInRange
          .filter(log => format(parseISO(log.date), "MMM") === mStr)
          .reduce((acc, log) => acc + log.hoursStudied, 0);
        return { name: mStr, hours: mHours };
      });
    } else if (range === "month") {
      // Group by weeks for month view
      const weeks = [];
      let current = startDate;
      while (current <= endDate) {
        const wStart = current;
        const wEnd = endOfWeek(current, { weekStartsOn: 1 });
        const weekLogs = logsInRange.filter(log => {
          const d = parseISO(log.date);
          return d >= wStart && d <= wEnd;
        });
        const wHours = weekLogs.reduce((acc, log) => acc + log.hoursStudied, 0);
        weeks.push({
          name: `W${Math.ceil((current.getDate() + 1) / 7)}`,
          hours: wHours
        });
        current = subDays(wEnd, -1);
        if (current.getMonth() !== startDate.getMonth()) break;
      }
      chartData = weeks;
    } else {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      chartData = days.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayHours = logsInRange
          .filter(log => log.date === dateStr)
          .reduce((acc, log) => acc + log.hoursStudied, 0);
        return {
          name: format(day, "EEE"),
          hours: dayHours
        };
      });
    }

    // Subject Breakdown
    const subjects = await Subject.find({ userId });
    const subjectBreakdown = subjects.map(sub => {
      const subHoursInRange = logsInRange
        .filter(log => log.subjectId.toString() === sub._id.toString())
        .reduce((acc, log) => acc + log.hoursStudied, 0);
      return {
        name: sub.name,
        hours: subHoursInRange,
        color: sub.color
      };
    }).filter(s => s.hours > 0);

    // Streak Logic
    const uniqueDates = Array.from(new Set(allLogs.map(l => l.date))).sort().reverse();
    let streak = 0;
    const current = new Date();
    
    // Check if user has logged today
    const hasToday = uniqueDates.includes(format(current, "yyyy-MM-dd"));
    const hasYesterday = uniqueDates.includes(format(subDays(current, 1), "yyyy-MM-dd"));

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? current : subDays(current, 1);
      while (uniqueDates.includes(format(checkDate, "yyyy-MM-dd"))) {
        streak++;
        checkDate = subDays(checkDate, 1);
      }
    }

    // Heatmap Data (last 6 months)
    const heatmapStartDate = subDays(new Date(), 180);
    const heatmapDays = eachDayOfInterval({ start: heatmapStartDate, end: new Date() });
    const heatmapData = heatmapDays.map(day => {
      const dStr = format(day, "yyyy-MM-dd");
      const dayLogs = allLogs.filter(l => l.date === dStr);
      const totalHours = dayLogs.reduce((acc, l) => acc + l.hoursStudied, 0);
      return {
        date: dStr,
        value: totalHours
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          todayHours,
          periodHours,
          totalHours,
          streak
        },
        chartData,
        subjectBreakdown,
        heatmapData,
        range
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
