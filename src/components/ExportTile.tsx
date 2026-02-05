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
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareableHTML = () => {
    const tierColors: Record<string, { bg: string; border: string; text: string }> = {
      platinum: { bg: "#1e1b4b", border: "#818cf8", text: "#c7d2fe" },
      gold: { bg: "#451a03", border: "#f59e0b", text: "#fef3c7" },
      silver: { bg: "#1f2937", border: "#9ca3af", text: "#e5e7eb" },
      bronze: { bg: "#292524", border: "#a8a29e", text: "#e7e5e4" },
    };

    const colors = tierColors[tileData.tier] || tierColors.silver;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta property="og:title" content="Proof Tile: ${tileData.title}">
  <meta property="og:description" content="${tileData.impactStatement || tileData.summary || "View my verified work"}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .tile {
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      color: ${colors.text};
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .badge {
      background: ${colors.border};
      color: ${colors.bg};
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .meta {
      font-size: 13px;
      opacity: 0.7;
      margin-bottom: 20px;
    }
    .summary {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .impact {
      font-size: 15px;
      font-weight: 600;
      color: #38bdf8;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.6;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .skill {
      background: rgba(255,255,255,0.1);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
    }
    .scores {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .score-box {
      background: rgba(255,255,255,0.05);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }
    .score-value {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    .score-label {
      font-size: 10px;
      text-transform: uppercase;
      opacity: 0.6;
    }
    .footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 11px;
      opacity: 0.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="tile">
    <div class="header">
      <span class="badge">${tileData.tier} Tier</span>
      <span class="badge">${tileData.kind}</span>
    </div>
    <h1 class="title">${tileData.title}</h1>
    <p class="meta">${tileData.repoName} • PR #${tileData.prNumber} • ${tileData.mergedAt ? `Merged ${new Date(tileData.mergedAt).toLocaleDateString()}` : "Closed"}</p>
    
    ${tileData.summary ? `<div class="summary">${tileData.summary}</div>` : ""}
    ${tileData.impactStatement ? `<p class="impact">💡 ${tileData.impactStatement}</p>` : ""}
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value" style="color: #4ade80;">+${tileData.additions}</div>
        <div class="stat-label">Added</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #f87171;">-${tileData.deletions}</div>
        <div class="stat-label">Removed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${tileData.filesChanged}</div>
        <div class="stat-label">Files</div>
      </div>
    </div>
    
    ${tileData.skills.length > 0 ? `
    <div class="skills">
      ${tileData.skills.map(s => `<span class="skill">${s}</span>`).join("")}
    </div>
    ` : ""}
    
    <div class="scores">
      <div class="score-box">
        <div class="score-value">${tileData.craftScore}</div>
        <div class="score-label">Craft</div>
      </div>
      <div class="score-box">
        <div class="score-value">${tileData.collabScore}</div>
        <div class="score-label">Collab</div>
      </div>
      <div class="score-box">
        <div class="score-value">${tileData.velocityScore}</div>
        <div class="score-label">Velocity</div>
      </div>
    </div>
    
    <div class="footer">Generated by Kinetic • Verified from GitHub</div>
  </div>
</body>
</html>`;
  };

  const handleCopyHTML = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(generateShareableHTML());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
    setCopying(false);
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
    const text = `🚀 Proof of Work: ${tileData.title}\n\n${tileData.impactStatement || tileData.summary || ""}\n\n📊 Craft: ${tileData.craftScore} | Collab: ${tileData.collabScore} | Velocity: ${tileData.velocityScore}\n🏆 ${tileData.tier.charAt(0).toUpperCase() + tileData.tier.slice(1)} Tier\n\nSkills: ${tileData.skills.join(", ")}\n\n#ProofOfWork #Developer #GitHub`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://github.com")}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all"
      >
        📥 Download Tile
      </button>
      <button
        onClick={handleCopyHTML}
        disabled={copying}
        className="px-4 py-2 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-all disabled:opacity-50"
      >
        {copied ? "✓ Copied!" : "📋 Copy HTML"}
      </button>
      <button
        onClick={handleLinkedInShare}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
      >
        💼 Share to LinkedIn
      </button>
    </div>
  );
}