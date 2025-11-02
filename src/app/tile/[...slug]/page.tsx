import { headers } from 'next/headers';
import { getCraftScore, getCollabScore, classifyKind } from "@/lib/signals";
import Replay from "./replay";

// @ts-ignore
function ScoreBar({ name, score }: { name: string, score: number }) {
  const barColor = score > 65 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="text-slate-300">{name}</span>
        <span className="font-bold text-slate-100">{score}</span>
      </div>
      <div className="bg-slate-700 rounded-full h-2.5">
        <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

// @ts-ignore
function DiffViewer({ patches }: { patches: { filename: string, status: string, patch: string }[] }) {
  const renderPatch = (patchText: string) => {
    return patchText.split('\n').map((line, i) => {
      let color = 'text-slate-400';
      if (line.startsWith('+')) color = 'text-green-400';
      if (line.startsWith('-')) color = 'text-red-400';
      if (line.startsWith('@@')) color = 'text-cyan-400';
      return <div key={i}><span className={color}>{line}</span></div>;
    });
  };

  return (
    <div className="mt-4 space-y-6">
      {patches.map((p, i) => (
        <div key={i} id={`diff-block-${i}`} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
          <div className="px-4 py-2 bg-slate-700/50 border-b border-slate-700 font-mono text-sm text-slate-300">
            {p.filename}
          </div>
          <pre className="m-0 p-4 font-mono text-xs leading-relaxed">{renderPatch(p.patch)}</pre>
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
    const cookie = readonlyRequestHeaders.get('cookie');
    const headersForFetch = new Headers();
    if (cookie) headersForFetch.set('cookie', cookie);
    
    const response = await fetch(`http://localhost:3000/api/github/pr-details?repo=${repoFullName}&number=${prNumber}`, { headers: headersForFetch });
    
    if (!response.ok) throw new Error("Failed to fetch tile data");
    const data = await response.json();
    
    const prDataForScoring = { 
      title: data.title || '',
      additions: data.additions || 0,
      deletions: data.deletions || 0,
      reviews: data.reviews || [], // Ensure 'reviews' is an empty array if it's missing
    };
    const craftScore = getCraftScore(prDataForScoring);
    const collabScore = getCollabScore(prDataForScoring);
    const kind = classifyKind(prDataForScoring);

    return (
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex justify-between items-start mb-8 border-b border-slate-700 pb-5">
          <div>
            <div className="text-sm font-semibold tracking-widest text-sky-400 uppercase">Proof Tile</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mt-1 leading-tight">{data.title}</h1>
          </div>
          <a href="/dashboard" className="text-sm text-sky-400 hover:underline whitespace-nowrap">← Back to Dashboard</a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="font-bold text-2xl mb-5 text-slate-200">Analysis</h2>
            <div className="space-y-4 text-lg text-slate-300">
              <p><strong>Kind:</strong> <span className="capitalize bg-slate-700 text-sky-300 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-slate-600">{kind}</span></p>
              <p><strong>Size:</strong> <span className="text-green-400 font-bold">+{data.additions}</span> / <span className="text-red-400 font-bold">-{data.deletions}</span> across {data.filesChanged} files.</p>
              <p><strong>Outcome:</strong> {data.mergedAt ? `Merged on ${new Date(data.mergedAt).toLocaleDateString()}` : 'Closed without merging.'}</p>
            </div>
          </section>
          
          <aside className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="font-bold text-2xl mb-5 text-slate-200">Signals</h2>
            <ScoreBar name="Craft" score={craftScore} />
            <ScoreBar name="Collaboration" score={collabScore} />
          </aside>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-2xl text-slate-200">Code Replay</h2>
            <Replay blockCount={data.patches.length} />
          </div>
          {data.patches.length > 0 ? (
            <DiffViewer patches={data.patches} />
          ) : (
            <div className="p-6 text-center text-slate-400 border border-slate-700 rounded-lg">No code changes to display.</div>
          )}
        </div>
      </main>
    );

  } catch (error) {
    console.error(error);
    return <main className="p-8 text-red-400">Error: Could not load Proof Tile. Ensure you are signed in and the PR exists.</main>;
  }
}