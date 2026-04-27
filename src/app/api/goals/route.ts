import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Goal from "@/models/Goal";
import StudyLog from "@/models/StudyLog";
import { goalSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const goals = await Goal.find({ userId: session.user.id }).populate("subjectId", "name color emoji");

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      let currentHours = 0;
      let startOfPeriod = new Date();

      if (goal.type === "daily") {
        startOfPeriod.setHours(0, 0, 0, 0);
      } else if (goal.type === "weekly") {
        const day = startOfPeriod.getDay() || 7;
        startOfPeriod.setHours(-24 * (day - 1));
      } else if (goal.type === "monthly") {
        startOfPeriod.setDate(1);
      } else {
        startOfPeriod = new Date(0); // Total
      }

      const query: { userId: string; date: { $gte: string }; subjectId?: string } = { 
        userId: session.user.id,
        date: { $gte: startOfPeriod.toISOString().split("T")[0] }
      };
      if (goal.subjectId) query.subjectId = goal.subjectId.toString();

      const logs = await StudyLog.find(query);
      currentHours = logs.reduce((acc, log) => acc + log.hoursStudied, 0);

      return {
        ...goal.toObject(),
        currentHours,
        progress: Math.min(100, Math.round((currentHours / goal.targetHours) * 100))
      };
    }));

    return NextResponse.json({ success: true, data: goalsWithProgress });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = goalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Validation failed", details: result.error.issues }, { status: 400 });
    }

    await dbConnect();
    const goal = await Goal.create({
      userId: session.user.id,
      ...result.data
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
