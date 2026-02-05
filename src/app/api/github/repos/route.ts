import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = session.accessToken;
    if (!token) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    const repos = data.map(repo => ({
      full_name: repo.full_name,
      default_branch: repo.default_branch || "main",
    }));

    return NextResponse.json(repos);
  } catch (error) {
    console.error("Failed to fetch repos:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch repositories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}