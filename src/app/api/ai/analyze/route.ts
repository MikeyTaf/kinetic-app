import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzePR } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, patches, additions, deletions } = body;

    if (!title) {
      return NextResponse.json({ error: "PR title is required" }, { status: 400 });
    }

    const analysis = await analyzePR({
      title,
      patches: patches || [],
      additions: additions || 0,
      deletions: deletions || 0,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}