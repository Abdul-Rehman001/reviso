import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import { subjectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const subjects = await Subject.find({ userId: session.user.id }).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: subjects });
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
    const result = subjectSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Validation failed", details: result.error.issues }, { status: 400 });
    }

    await dbConnect();

    // Check unique name constraint
    const existing = await Subject.findOne({ userId: session.user.id, name: result.data.name });
    if (existing) {
      return NextResponse.json({ success: false, error: "Subject with this name already exists" }, { status: 400 });
    }

    const newSubject = await Subject.create({
      userId: session.user.id,
      ...result.data
    });

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
