"use client";

import { useState } from "react";

type ExportTileProps = {
  tileData: {
    title: string;
    kind: string;
    additions: number;
    deletions: number;
    filesChanged: number;
    mergedAt: string | null;
    craftScore: number;
    collabScore: number;
    velocityScore: number;
    skills: string[];
    tier: string;
    summary?: string;
    impactStatement?: string;
    repoName: string;
    prNumber: string;
  };
};

export default function ExportTile({ tileData }: ExportTileProps) {
  const [copied, setCopied] = useState(false);

  const generateShareableHTML = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #09090b; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .tile { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; text-transform: uppercase; background: #3f3f46; color: #a1a1aa; }
    .title { font-size: 18px; font-weight: 600; color: #fafafa; margin-bottom: 8px; line-height: 1.4; }
    .meta { font-size: 12px; color: #71717a; margin-bottom: 20px; font-family: monospace; }
    .summary { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 16px; }
    .impact { font-size: 14px; color: #22d3ee; margin-bottom: 20px; padding: 12px; background: rgba(34, 211, 238, 0.1); border-radius: 8px; border-left: 2px solid #22d3ee; }
    .stats { display: flex; gap: 16px; margin-bottom: 20px; }
    .stat { text-align: center; flex: 1; }
    .stat-value { font-size: 20px; font-weight: 600; }
    .stat-value.green { color: #4ade80; }
    .stat-value.red { color: #f87171; }
    .stat-label { font-size: 10px; text-transform: uppercase; color: #71717a; margin-top: 2px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
    .skill { background: #27272a; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #d4d4d8; }
    .scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding-top: 16px; border-top: 1px solid #27272a; }
    .score { text-align: center; }
    .score-value { font-size: 24px; font-weight: 600; color: #fafafa; }
    .score-label { font-size: 10px; text-transform: uppercase; color: #71717a; }
  </style>
</head>
<body>
  <div class="tile">
    <div class="header">
      <span class="badge">${tileData.tier}</span>
      <span class="badge">${tileData.kind}</span>
    </div>
    <h1 class="title">${tileData.title}</h1>
    <p class="meta">${tileData.repoName} #${tileData.prNumber}</p>
    ${tileData.summary ? `<p class="summary">${tileData.summary}</p>` : ""}
    ${tileData.impactStatement ? `<p class="impact">${tileData.impactStatement}</p>` : ""}
    <div class="stats">
      <div class="stat"><div class="stat-value green">+${tileData.additions}</div><div class="stat-label">Added</div></div>
      <div class="stat"><div class="stat-value red">-${tileData.deletions}</div><div class="stat-label">Removed</div></div>
      <div class="stat"><div class="stat-value">${tileData.filesChanged}</div><div class="stat-label">Files</div></div>
    </div>
    ${tileData.skills.length > 0 ? `<div class="skills">${tileData.skills.map(s => `<span class="skill">${s}</span>`).join("")}</div>` : ""}
    <div class="scores">
      <div class="score"><div class="score-value">${tileData.craftScore}</div><div class="score-label">Craft</div></div>
      <div class="score"><div class="score-value">${tileData.collabScore}</div><div class="score-label">Collab</div></div>
      <div class="score"><div class="score-value">${tileData.velocityScore}</div><div class="score-label">Velocity</div></div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableHTML());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownload = () => {
    const html = generateShareableHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proof-tile-${tileData.repoName.replace("/", "-")}-${tileData.prNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLinkedInShare = () => {
    const text = `${tileData.title}\n\n${tileData.impactStatement || tileData.summary || ""}\n\nCraft: ${tileData.craftScore} | Collab: ${tileData.collabScore} | Velocity: ${tileData.velocityScore}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://github.com/" + tileData.repoName)}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="font-medium text-sm">Share</h3>
        <p className="text-xs text-zinc-500">Export your proof tile</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span className="text-xs text-zinc-400">Download</span>
          </button>
          <button
            onClick={handleCopyHTML}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-zinc-400">{copied ? "Copied!" : "Copy"}</span>
          </button>
          <button
            onClick={handleLinkedInShare}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-xs text-zinc-400">LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
