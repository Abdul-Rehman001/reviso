import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import StudyLog from "@/models/StudyLog";
import Topic from "@/models/Topic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const subject = await Subject.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const subject = await Subject.findOneAndDelete({ _id: params.id, userId: session.user.id });
    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });
    }

    // Cascade delete logs and topics
    await StudyLog.deleteMany({ subjectId: params.id });
    await Topic.deleteMany({ subjectId: params.id });

    return NextResponse.json({ success: true, message: "Subject and related data deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
