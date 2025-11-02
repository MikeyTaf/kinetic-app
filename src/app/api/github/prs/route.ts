import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  // Get the repo name from the request URL, e.g., /api/github/prs?repo=user/my-repo
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get("repo");
  if (!repoFullName) {
    return NextResponse.json({ error: "Repo parameter is required" }, { status: 400 });
  }
  
  const [owner, repo] = repoFullName.split("/");

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = new Octokit({ auth: token });
  
  // Call the GitHub API to get the closed PRs for this specific repo
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "closed", // We only care about completed work
    per_page: 30, // Get the 30 most recent ones
    sort: "updated",
    direction: "desc",
  });

  // --- THIS IS THE FIX ---
  // We are now only sending back data that is guaranteed to be in the list view.
  const prs = data.map(pr => ({
    number: pr.number,
    title: pr.title,
  }));

  return NextResponse.json(prs);
}