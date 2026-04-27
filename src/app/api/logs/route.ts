import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudyLog from "@/models/StudyLog";
import Subject from "@/models/Subject";
import { studyLogSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // We expect an array of logs if saving multiple at once, or a single log
    const logsToSave = Array.isArray(body) ? body : [body];
    
    await dbConnect();
    
    const savedLogs = [];

    // Process sequentially to ensure DB consistency
    for (const logData of logsToSave) {
      const result = studyLogSchema.safeParse(logData);
      if (!result.success) continue; // Skip invalid entries silently, or we could throw

      const data = result.data;
      
      // Upsert: update if exists for this user/subject/date, otherwise insert
      const log = await StudyLog.findOneAndUpdate(
        { 
          userId: session.user.id, 
          subjectId: data.subjectId, 
          date: data.date 
        },
        { 
          $set: {
            hoursStudied: data.hoursStudied,
            notes: data.notes,
            topicsStudied: data.topicsStudied,
            mood: data.mood,
            updatedAt: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      savedLogs.push(log);

      // Recalculate Subject totalHours
      const allLogsForSubject = await StudyLog.find({ subjectId: data.subjectId });
      const totalHours = allLogsForSubject.reduce((sum, l) => sum + l.hoursStudied, 0);
      await Subject.findByIdAndUpdate(data.subjectId, { totalHours });
    }

    // TODO: Recalculate Streak here (we'll implement this later)

    return NextResponse.json({ success: true, data: savedLogs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("POST Logs Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
