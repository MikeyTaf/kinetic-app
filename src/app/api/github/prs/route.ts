import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoFullName = searchParams.get("repo");
    if (!repoFullName) {
      return NextResponse.json({ error: "Repo parameter is required" }, { status: 400 });
    }
    
    const parts = repoFullName.split("/");
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid repo format. Expected owner/repo" }, { status: 400 });
    }
    const [owner, repo] = parts;

    const session = await getServerSession(authOptions);
    const token = session?.accessToken;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: token });
    
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "closed",
      per_page: 30,
      sort: "updated",
      direction: "desc",
    });

    const prs = data.map(pr => ({
      number: pr.number,
      title: pr.title,
    }));

    return NextResponse.json(prs);
  } catch (error) {
    console.error("Failed to fetch PRs:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pull requests";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}