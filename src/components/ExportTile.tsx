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
    const tierColors: Record<string, { bg: string; accent: string }> = {
      platinum: { bg: "#1e1b4b", accent: "#818cf8" },
      gold: { bg: "#451a03", accent: "#f59e0b" },
      silver: { bg: "#1f2937", accent: "#94a3b8" },
      bronze: { bg: "#292524", accent: "#ea580c" },
    };
    const colors = tierColors[tileData.tier] || tierColors.silver;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Space Grotesk', sans-serif; background: #0a0a0f; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .tile { background: linear-gradient(135deg, ${colors.bg} 0%, #0a0a0f 100%); border: 1px solid ${colors.accent}40; border-radius: 20px; padding: 32px; max-width: 480px; width: 100%; position: relative; overflow: hidden; }
    .tile::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, ${colors.accent}, transparent); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .badge { padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${colors.accent}; color: #0a0a0f; }
    .kind { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8888a0; text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 700; color: #f0f0f5; margin-bottom: 8px; line-height: 1.3; }
    .meta { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #55556a; margin-bottom: 24px; }
    .summary { font-size: 14px; line-height: 1.7; color: #8888a0; margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 2px solid ${colors.accent}; }
    .impact { font-size: 14px; font-weight: 500; color: #00f0ff; margin-bottom: 24px; padding-left: 12px; border-left: 2px solid #00f0ff; }
    .stats { display: flex; gap: 20px; margin-bottom: 24px; }
    .stat { text-align: center; flex: 1; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-value.green { color: #00ff88; }
    .stat-value.red { color: #ff4466; }
    .stat-value.neutral { color: #f0f0f5; }
    .stat-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; color: #55556a; margin-top: 4px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .skill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px; font-size: 12px; color: #f0f0f5; }
    .scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .score-box { background: rgba(255,255,255,0.03); padding: 16px 12px; border-radius: 12px; text-align: center; }
    .score-value { font-size: 28px; font-weight: 700; color: #f0f0f5; }
    .score-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; color: #55556a; margin-top: 4px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #55556a; text-align: center; }
  </style>
</head>
<body>
  <div class="tile">
    <div class="header"><span class="badge">${tileData.tier}</span><span class="kind">${tileData.kind}</span></div>
    <h1 class="title">${tileData.title}</h1>
    <p class="meta">${tileData.repoName} #${tileData.prNumber}${tileData.mergedAt ? " // merged " + new Date(tileData.mergedAt).toLocaleDateString() : ""}</p>
    ${tileData.summary ? `<div class="summary">${tileData.summary}</div>` : ""}
    ${tileData.impactStatement ? `<p class="impact">${tileData.impactStatement}</p>` : ""}
    <div class="stats">
      <div class="stat"><div class="stat-value green">+${tileData.additions}</div><div class="stat-label">Added</div></div>
      <div class="stat"><div class="stat-value red">-${tileData.deletions}</div><div class="stat-label">Removed</div></div>
      <div class="stat"><div class="stat-value neutral">${tileData.filesChanged}</div><div class="stat-label">Files</div></div>
    </div>
    ${tileData.skills.length > 0 ? `<div class="skills">${tileData.skills.map(s => `<span class="skill">${s}</span>`).join("")}</div>` : ""}
    <div class="scores">
      <div class="score-box"><div class="score-value">${tileData.craftScore}</div><div class="score-label">Craft</div></div>
      <div class="score-box"><div class="score-value">${tileData.collabScore}</div><div class="score-label">Collab</div></div>
      <div class="score-box"><div class="score-value">${tileData.velocityScore}</div><div class="score-label">Velocity</div></div>
    </div>
    <div class="footer">Generated by Kinetic // Verified from GitHub</div>
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
    const text = `Proof of Work: ${tileData.title}\n\n${tileData.impactStatement || tileData.summary || ""}\n\nCraft: ${tileData.craftScore} | Collaboration: ${tileData.collabScore} | Velocity: ${tileData.velocityScore}\n\nSkills: ${tileData.skills.join(", ")}\n\n#Developer #GitHub #ProofOfWork`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://github.com/" + tileData.repoName)}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] font-semibold">Share Your Work</h3>
            <p className="text-xs text-[#55556a] font-['JetBrains_Mono']">export proof tile</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleDownload} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all duration-200 group">
            <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs font-medium text-[#8888a0] group-hover:text-[#00ff88]">Download</span>
          </button>
          <button onClick={handleCopyHTML} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#a855f7]/30 hover:bg-[#a855f7]/5 transition-all duration-200 group">
            <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-[#8888a0] group-hover:text-[#a855f7]">{copied ? "Copied!" : "Copy HTML"}</span>
          </button>
          <button onClick={handleLinkedInShare} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5 transition-all duration-200 group">
            <svg className="w-5 h-5 text-[#00f0ff]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-xs font-medium text-[#8888a0] group-hover:text-[#00f0ff]">LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
