import { headers } from "next/headers";
import Link from "next/link";
import {
  getCraftScore,
  getCollabScore,
  getVelocityScore,
  classifyKind,
  detectSkills,
  getProofStrength,
} from "@/lib/signals";
import TileClient from "./TileClient";

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    platinum: "bg-violet-500/20 text-violet-300",
    gold: "bg-amber-500/20 text-amber-300",
    silver: "bg-neutral-500/20 text-neutral-300",
    bronze: "bg-orange-500/20 text-orange-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[tier] || styles.silver}`}>
      {tier}
    </span>
  );
}

function DiffViewer({ patches }: { patches: { filename: string; status: string; patch: string }[] }) {
  return (
    <div className="space-y-3">
      {patches.slice(0, 10).map((p, i) => (
        <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-neutral-800/50 border-b border-neutral-800">
            <span className="text-xs text-neutral-400 font-mono">{p.filename}</span>
          </div>
          <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed max-h-64 overflow-y-auto">
            {p.patch.split("\n").slice(0, 50).map((line, j) => {
              let color = "text-neutral-500";
              if (line.startsWith("+")) color = "text-green-400";
              if (line.startsWith("-")) color = "text-red-400";
              if (line.startsWith("@@")) color = "text-blue-400";
              return <div key={j} className={color}>{line || " "}</div>;
            })}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default async function TilePage({ params }: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug } = await params;
    const [owner, repo, prNumber] = slug;
    const repoFullName = `${owner}/${repo}`;

    const readonlyRequestHeaders = await headers();
    const cookie = readonlyRequestHeaders.get("cookie");
    const host = readonlyRequestHeaders.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const headersForFetch = new Headers();
    if (cookie) headersForFetch.set("cookie", cookie);

    const baseUrl = `${protocol}://${host}`;
    const response = await fetch(
      `${baseUrl}/api/github/pr-details?repo=${repoFullName}&number=${prNumber}`,
      { headers: headersForFetch, cache: "no-store" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch tile data");
    }
    const data = await response.json();

    const prDataForScoring = {
      title: data.title || "",
      additions: data.additions || 0,
      deletions: data.deletions || 0,
      reviews: data.reviews || [],
      patches: data.patches || [],
    };

    const craftScore = getCraftScore(prDataForScoring);
    const collabScore = getCollabScore(prDataForScoring);
    const velocityScore = getVelocityScore(prDataForScoring);
    const kind = classifyKind(prDataForScoring);
    const skills = detectSkills(prDataForScoring);
    const { tier } = getProofStrength(prDataForScoring);
    const overallScore = Math.round((craftScore + collabScore + velocityScore) / 3);

    const tileData = {
      title: data.title, kind, additions: data.additions, deletions: data.deletions,
      filesChanged: data.filesChanged, mergedAt: data.mergedAt, craftScore, collabScore,
      velocityScore, skills, tier, repoName: repoFullName, prNumber,
    };

    const prDataForAI = {
      title: data.title, patches: data.patches || [],
      additions: data.additions, deletions: data.deletions,
    };

    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        {/* Header */}
        <header className="h-14 border-b border-neutral-800 bg-[#0f0f0f]">
          <div className="max-w-5xl mx-auto px-5 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-black font-bold text-base">K</span>
                </div>
                <span className="font-semibold text-white">Kinetic</span>
              </Link>
              <span className="text-neutral-600 text-sm">/</span>
              <span className="text-neutral-400 text-sm">Proof Tile</span>
            </div>
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 py-8">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TierBadge tier={tier} />
              <span className="text-xs text-neutral-500 uppercase">{kind}</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">{data.title}</h1>
            <p className="text-sm text-neutral-500 font-mono">
              {repoFullName} #{prNumber}
              {data.mergedAt && ` · ${new Date(data.mergedAt).toLocaleDateString()}`}
            </p>
          </div>

          {/* AI + Export */}
          <div className="mb-6">
            <TileClient tileData={tileData} prDataForAI={prDataForAI} />
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Metrics */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
              <h2 className="text-sm font-medium text-white mb-4">Metrics</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-semibold text-green-400">+{data.additions}</div>
                  <div className="text-xs text-neutral-500">Added</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-red-400">-{data.deletions}</div>
                  <div className="text-xs text-neutral-500">Removed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-white">{data.filesChanged}</div>
                  <div className="text-xs text-neutral-500">Files</div>
                </div>
              </div>
              {skills.length > 0 && (
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-neutral-800 text-xs text-neutral-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scores */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
              <h2 className="text-sm font-medium text-white mb-4">Scores</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-semibold text-white">{craftScore}</div>
                  <div className="text-xs text-neutral-500">Craft</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-white">{collabScore}</div>
                  <div className="text-xs text-neutral-500">Collab</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-white">{velocityScore}</div>
                  <div className="text-xs text-neutral-500">Velocity</div>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-800 text-center">
                <div className="text-3xl font-bold text-white">{overallScore}</div>
                <div className="text-xs text-neutral-500">Overall</div>
              </div>
            </div>
          </div>

          {/* Code */}
          <div>
            <h2 className="text-sm font-medium text-white mb-3">Code Changes</h2>
            {data.patches && data.patches.length > 0 ? (
              <DiffViewer patches={data.patches} />
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
                <p className="text-neutral-500 text-sm">No code changes to display</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Tile page error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-5">
        <div className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
          <h1 className="text-sm font-medium text-red-400 mb-2">Error</h1>
          <p className="text-neutral-400 text-sm mb-4">{message}</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 rounded-lg bg-neutral-800 text-sm text-white hover:bg-neutral-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
