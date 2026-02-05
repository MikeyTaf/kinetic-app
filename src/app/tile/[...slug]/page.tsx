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
import Replay from "./replay";
import TileClient from "./TileClient";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90">
          <circle cx="48" cy="48" r="36" stroke="#2a2a3a" strokeWidth="6" fill="none" />
          <circle
            cx="48" cy="48" r="36" stroke={color} strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#f0f0f5]">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-['JetBrains_Mono'] text-[#55556a] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const tierConfig: Record<string, string> = {
    platinum: "tier-platinum",
    gold: "tier-gold", 
    silver: "tier-silver",
    bronze: "tier-bronze",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${tierConfig[tier] || tierConfig.silver}`}>
      {tier}
    </span>
  );
}

function DiffViewer({ patches }: { patches: { filename: string; status: string; patch: string }[] }) {
  const renderPatch = (patchText: string) => {
    return patchText.split("\n").map((line, i) => {
      let colorClass = "text-[#55556a]";
      if (line.startsWith("+")) colorClass = "text-[#00ff88]";
      if (line.startsWith("-")) colorClass = "text-[#ff4466]";
      if (line.startsWith("@@")) colorClass = "text-[#00f0ff]";
      return <div key={i} className={`${colorClass} hover:bg-white/5`}>{line}</div>;
    });
  };

  return (
    <div className="space-y-4">
      {patches.map((p, i) => (
        <div key={i} id={`diff-block-${i}`} className="rounded-xl overflow-hidden bg-[#0d0d12] border border-[#2a2a3a]">
          <div className="px-4 py-3 bg-[#151520] border-b border-[#2a2a3a] flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
            </div>
            <span className="font-['JetBrains_Mono'] text-sm text-[#8888a0]">{p.filename}</span>
          </div>
          <pre className="p-4 font-['JetBrains_Mono'] text-xs leading-relaxed overflow-x-auto">
            {renderPatch(p.patch)}
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
      <main className="min-h-screen">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3a]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">K</span>
                </div>
                <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight hidden sm:block">kinetic</span>
              </Link>
              <div className="h-6 w-px bg-[#2a2a3a]" />
              <span className="text-[#8888a0] text-sm font-['JetBrains_Mono']">proof tile</span>
            </div>
            <Link href="/dashboard" className="text-sm text-[#00f0ff] hover:underline font-medium">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <TierBadge tier={tier} />
              <span className="px-3 py-1 rounded-full bg-[#151520] border border-[#2a2a3a] text-xs font-['JetBrains_Mono'] text-[#8888a0] uppercase">
                {kind}
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold text-[#f0f0f5] leading-tight">
              {data.title}
            </h1>
            <p className="mt-3 font-['JetBrains_Mono'] text-sm text-[#55556a]">
              {repoFullName} #{prNumber}
              {data.mergedAt && ` // merged ${new Date(data.mergedAt).toLocaleDateString()}`}
            </p>
          </div>

          <div className="mb-8 animate-fade-in animate-delay-1">
            <TileClient tileData={tileData} prDataForAI={prDataForAI} />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 rounded-2xl bg-[#151520] border border-[#2a2a3a] p-6 animate-fade-in animate-delay-2">
              <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-6">Metrics</h2>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="font-['Space_Grotesk'] text-3xl font-bold text-[#00ff88]">+{data.additions}</div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#55556a] mt-1">ADDED</div>
                </div>
                <div className="text-center">
                  <div className="font-['Space_Grotesk'] text-3xl font-bold text-[#ff4466]">-{data.deletions}</div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#55556a] mt-1">REMOVED</div>
                </div>
                <div className="text-center">
                  <div className="font-['Space_Grotesk'] text-3xl font-bold text-[#f0f0f5]">{data.filesChanged}</div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#55556a] mt-1">FILES</div>
                </div>
              </div>
              {skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-['JetBrains_Mono'] text-[#55556a] uppercase mb-3">Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-sm text-[#f0f0f5]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] p-6 animate-fade-in animate-delay-3">
              <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-6 text-center">Signals</h2>
              <div className="flex flex-col items-center gap-6">
                <ScoreRing score={craftScore} label="Craft" color="#00ff88" />
                <ScoreRing score={collabScore} label="Collab" color="#00f0ff" />
                <ScoreRing score={velocityScore} label="Velocity" color="#a855f7" />
              </div>
              <div className="mt-6 pt-6 border-t border-[#2a2a3a] text-center">
                <div className="font-['Space_Grotesk'] text-4xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent">
                  {overallScore}
                </div>
                <div className="text-xs font-['JetBrains_Mono'] text-[#55556a] mt-1">OVERALL</div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in animate-delay-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Space_Grotesk'] text-xl font-semibold">Code Changes</h2>
              <Replay blockCount={data.patches?.length || 0} />
            </div>
            {data.patches && data.patches.length > 0 ? (
              <DiffViewer patches={data.patches} />
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#151520] border border-[#2a2a3a]">
                <p className="text-[#55556a]">No code changes to display</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Tile page error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl bg-[#151520] border border-[#ff4466]/30 p-8 text-center">
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#ff4466] mb-2">Error Loading Tile</h1>
          <p className="text-[#8888a0] mb-6">{message}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-[#00f0ff] font-medium hover:border-[#00f0ff]/30 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }
}