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
    body { font-family: 'Inter', system-ui, sans-serif; background: #0f0f0f; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .tile { background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; }
    .header { display: flex; gap: 8px; margin-bottom: 16px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; background: #262626; color: #a3a3a3; }
    .title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 6px; line-height: 1.4; }
    .meta { font-size: 12px; color: #737373; margin-bottom: 16px; font-family: monospace; }
    .summary { font-size: 13px; line-height: 1.5; color: #a3a3a3; margin-bottom: 12px; }
    .impact { font-size: 13px; color: #fff; margin-bottom: 16px; padding: 12px; background: #262626; border-radius: 6px; }
    .stats { display: flex; gap: 16px; margin-bottom: 16px; }
    .stat { text-align: center; flex: 1; }
    .stat-value { font-size: 18px; font-weight: 600; }
    .stat-value.green { color: #4ade80; }
    .stat-value.red { color: #f87171; }
    .stat-label { font-size: 10px; text-transform: uppercase; color: #737373; margin-top: 2px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .skill { background: #262626; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #d4d4d4; }
    .scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding-top: 16px; border-top: 1px solid #262626; }
    .score { text-align: center; }
    .score-value { font-size: 20px; font-weight: 600; color: #fff; }
    .score-label { font-size: 10px; text-transform: uppercase; color: #737373; }
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
      <h3 className="text-sm font-medium text-white mb-1">Export</h3>
      <p className="text-xs text-neutral-500 mb-4">Share your proof tile</p>
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-2 rounded-lg bg-neutral-800 text-sm text-white hover:bg-neutral-700 transition-colors"
        >
          Download
        </button>
        <button
          onClick={handleCopyHTML}
          className="flex-1 py-2 rounded-lg bg-neutral-800 text-sm text-white hover:bg-neutral-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy HTML"}
        </button>
        <button
          onClick={handleLinkedInShare}
          className="flex-1 py-2 rounded-lg bg-neutral-800 text-sm text-white hover:bg-neutral-700 transition-colors"
        >
          LinkedIn
        </button>
      </div>
    </div>
  );
}
