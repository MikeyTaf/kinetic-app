import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Go up two folders to find our auth config
import { Octokit } from "@octokit/rest"; // This is the official GitHub library

export async function GET() {
  // 1. Check if the user is logged in and get their session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get the access token we saved during login
  const token = (session as any).accessToken;
  if (!token) {
    return NextResponse.json({ error: "GitHub token not found" }, { status: 401 });
  }

  // 3. Initialize the GitHub library (Octokit) with the user's token
  const octokit = new Octokit({ auth: token });

  // 4. Call the GitHub API to get the user's repos
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100, // Get up to 100 repos
    sort: "updated", // Show the most recently updated ones first
  });

  // 5. Clean up the data, sending back only what we need
  const repos = data.map(repo => ({
    full_name: repo.full_name, // e.g., "your-username/kinetic-demo"
    default_branch: repo.default_branch || "main",
  }));

  // 6. Send the list of repos back as a response
  return NextResponse.json(repos);
}