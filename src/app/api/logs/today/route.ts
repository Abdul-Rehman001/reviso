import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudyLog from "@/models/StudyLog";

// Helper to get local date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split("T")[0];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayString();

    await dbConnect();
    const logs = await StudyLog.find({ userId: session.user.id, date });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
