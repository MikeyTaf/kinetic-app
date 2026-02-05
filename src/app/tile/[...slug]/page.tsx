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

function ScoreCard({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-semibold ${color}`}>{score}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    platinum: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    gold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    silver: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    bronze: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[tier] || styles.silver}`}>
      {tier}
    </span>
  );
}

function DiffViewer({ patches }: { patches: { filename: string; status: string; patch: string }[] }) {
  return (
    <div className="space-y-4">
      {patches.map((p, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-zinc-400 font-mono ml-2">{p.filename}</span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
            {p.patch.split("\n").map((line, j) => {
              let color = "text-zinc-500";
              if (line.startsWith("+")) color = "text-emerald-400";
              if (line.startsWith("-")) color = "text-red-400";
              if (line.startsWith("@@")) color = "text-cyan-400";
              return <div key={j} className={color}>{line}</div>;
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
      <div className="min-h-screen bg-zinc-950">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                  <span className="text-zinc-950 font-bold text-sm">K</span>
                </div>
                <span className="font-semibold">Kinetic</span>
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 text-sm">Proof Tile</span>
            </div>
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Title section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TierBadge tier={tier} />
              <span className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-zinc-400 uppercase">
                {kind}
              </span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
            <p className="text-sm text-zinc-500 font-mono">
              {repoFullName} #{prNumber}
              {data.mergedAt && ` · merged ${new Date(data.mergedAt).toLocaleDateString()}`}
            </p>
          </div>

          {/* AI Analysis + Export */}
          <div className="mb-8">
            <TileClient tileData={tileData} prDataForAI={prDataForAI} />
          </div>

          {/* Stats grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Metrics */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="font-medium mb-4">Metrics</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-emerald-400">+{data.additions}</div>
                  <div className="text-xs text-zinc-500 uppercase">Added</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-red-400">-{data.deletions}</div>
                  <div className="text-xs text-zinc-500 uppercase">Removed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{data.filesChanged}</div>
                  <div className="text-xs text-zinc-500 uppercase">Files</div>
                </div>
              </div>
              {skills.length > 0 && (
                <div>
                  <h3 className="text-xs text-zinc-500 uppercase mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scores */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="font-medium mb-4">Scores</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <ScoreCard score={craftScore} label="Craft" color="text-emerald-400" />
                <ScoreCard score={collabScore} label="Collab" color="text-cyan-400" />
                <ScoreCard score={velocityScore} label="Velocity" color="text-violet-400" />
              </div>
              <div className="pt-4 border-t border-zinc-800 text-center">
                <div className="text-4xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {overallScore}
                </div>
                <div className="text-xs text-zinc-500 uppercase mt-1">Overall</div>
              </div>
            </div>
          </div>

          {/* Code changes */}
          <div>
            <h2 className="font-medium mb-4">Code Changes</h2>
            {data.patches && data.patches.length > 0 ? (
              <DiffViewer patches={data.patches} />
            ) : (
              <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm">No code changes to display</p>
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <h1 className="font-semibold text-red-400 mb-2">Error Loading Tile</h1>
          <p className="text-zinc-400 text-sm mb-4">{message}</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
