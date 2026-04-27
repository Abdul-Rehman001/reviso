import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudyLog from "@/models/StudyLog";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await dbConnect();

    const query: { userId: string; subjectId?: string; date?: { $gte?: string; $lte?: string } } = { userId: session.user.id };
    if (subjectId) query.subjectId = subjectId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const logs = await StudyLog.find(query)
      .sort({ date: -1 })
      .populate("subjectId", "name color emoji");

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
