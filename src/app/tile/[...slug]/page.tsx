import { headers } from "next/headers";
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

function ScoreBar({ name, score, color }: { name: string; score: number; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="text-slate-300">{name}</span>
        <span className="font-bold text-slate-100">{score}</span>
      </div>
      <div className="bg-slate-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const tierStyles: Record<string, string> = {
    platinum: "bg-indigo-500/20 text-indigo-300 border-indigo-400",
    gold: "bg-amber-500/20 text-amber-300 border-amber-400",
    silver: "bg-slate-400/20 text-slate-300 border-slate-400",
    bronze: "bg-orange-700/20 text-orange-300 border-orange-600",
  };

  const style = tierStyles[tier] || tierStyles.silver;

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${style}`}>
      {tier} Tier
    </span>
  );
}

function DiffViewer({ patches }: { patches: { filename: string; status: string; patch: string }[] }) {
  const renderPatch = (patchText: string) => {
    return patchText.split("\n").map((line, i) => {
      let color = "text-slate-400";
      if (line.startsWith("+")) color = "text-green-400";
      if (line.startsWith("-")) color = "text-red-400";
      if (line.startsWith("@@")) color = "text-cyan-400";
      return (
        <div key={i}>
          <span className={color}>{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="mt-4 space-y-6">
      {patches.map((p, i) => (
        <div
          key={i}
          id={`diff-block-${i}`}
          className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800"
        >
          <div className="px-4 py-2 bg-slate-700/50 border-b border-slate-700 font-mono text-sm text-slate-300">
            {p.filename}
          </div>
          <pre className="m-0 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
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
      {
        headers: headersForFetch,
        cache: "no-store",
      }
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

    const tileData = {
      title: data.title,
      kind,
      additions: data.additions,
      deletions: data.deletions,
      filesChanged: data.filesChanged,
      mergedAt: data.mergedAt,
      craftScore,
      collabScore,
      velocityScore,
      skills,
      tier,
      repoName: repoFullName,
      prNumber,
    };

    const prDataForAI = {
      title: data.title,
      patches: data.patches || [],
      additions: data.additions,
      deletions: data.deletions,
    };

    return (
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-slate-700 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold tracking-widest text-sky-400 uppercase">
                Proof Tile
              </span>
              <TierBadge tier={tier} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mt-1 leading-tight">
              {data.title}
            </h1>
            <p className="text-slate-400 mt-2">
              {repoFullName} - PR #{prNumber}
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-sky-400 hover:underline whitespace-nowrap"
          >
            Back to Dashboard
          </a>
        </header>

        <TileClient tileData={tileData} prDataForAI={prDataForAI} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <section className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="font-bold text-2xl mb-5 text-slate-200">Analysis</h2>
            <div className="space-y-4 text-lg text-slate-300">
              <p>
                <strong>Kind:</strong>{" "}
                <span className="capitalize bg-slate-700 text-sky-300 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-slate-600">
                  {kind}
                </span>
              </p>
              <p>
                <strong>Size:</strong>{" "}
                <span className="text-green-400 font-bold">+{data.additions}</span> /{" "}
                <span className="text-red-400 font-bold">-{data.deletions}</span> across{" "}
                {data.filesChanged} files.
              </p>
              <p>
                <strong>Outcome:</strong>{" "}
                {data.mergedAt
                  ? `Merged on ${new Date(data.mergedAt).toLocaleDateString()}`
                  : "Closed without merging."}
              </p>

              {skills.length > 0 && (
                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="font-bold text-2xl mb-5 text-slate-200">Signals</h2>
            <ScoreBar name="Craft" score={craftScore} color="bg-emerald-500" />
            <ScoreBar name="Collaboration" score={collabScore} color="bg-blue-500" />
            <ScoreBar name="Velocity" score={velocityScore} color="bg-purple-500" />

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {Math.round((craftScore + collabScore + velocityScore) / 3)}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">
                  Overall Score
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-2xl text-slate-200">Code Replay</h2>
            <Replay blockCount={data.patches?.length || 0} />
          </div>
          {data.patches && data.patches.length > 0 ? (
            <DiffViewer patches={data.patches} />
          ) : (
            <div className="p-6 text-center text-slate-400 border border-slate-700 rounded-lg">
              No code changes to display.
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Tile page error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-400 mb-2">Error Loading Proof Tile</h1>
          <p className="text-red-300">{message}</p>
          <p className="text-slate-400 mt-4">
            Ensure you are signed in and the PR exists.
          </p>
          <a href="/dashboard" className="inline-block mt-4 text-sky-400 hover:underline">
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }
}
