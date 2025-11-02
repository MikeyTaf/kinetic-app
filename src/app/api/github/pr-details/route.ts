import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get("repo");
  const prNumberStr = searchParams.get("number");

  if (!repoFullName || !prNumberStr) {
    return NextResponse.json({ error: "Repo and PR number are required" }, { status: 400 });
  }

  const [owner, repo] = repoFullName.split("/");
  const pull_number = Number(prNumberStr);

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No session token found" }, { status: 401 });
  }

  const octokit = new Octokit({ auth: token });
  
  try {
    // --- THIS IS THE UPGRADED FETCH ---
    // We now fetch four things in parallel: details, files, reviews, AND comments.
    const [prDetailsResponse, filesResponse, reviewsResponse, commentsResponse] = await Promise.all([
      octokit.pulls.get({ owner, repo, pull_number }),
      octokit.pulls.listFiles({ owner, repo, pull_number }),
      octokit.pulls.listReviews({ owner, repo, pull_number }),
      octokit.issues.listComments({ owner, repo, issue_number: pull_number }), // PRs are also issues, so we fetch their comments here.
    ]);

    // Combine both formal reviews and general comments into one list for scoring
    const reviewBodies = reviewsResponse.data.map(review => ({ body: review.body || "" }));
    const commentBodies = commentsResponse.data.map(comment => ({ body: comment.body || "" }));
    const allDiscussion = [...reviewBodies, ...commentBodies];

    // Build the final data object
    const data = {
      title: prDetailsResponse.data.title,
      additions: prDetailsResponse.data.additions,
      deletions: prDetailsResponse.data.deletions,
      filesChanged: prDetailsResponse.data.changed_files,
      mergedAt: prDetailsResponse.data.merged_at,
      reviews: allDiscussion, // Use the new combined list
      patches: filesResponse.data.filter(f => !!f.patch).map(f => ({
        filename: f.filename,
        status: f.status,
        patch: f.patch!,
      })),
    };
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Failed to fetch PR details:", error);
    return NextResponse.json({ error: "Failed to fetch PR details" }, { status: 500 });
  }
}