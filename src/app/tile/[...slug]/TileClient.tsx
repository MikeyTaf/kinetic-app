"use client";

import { useState } from "react";
import AIAnalysis, { AIAnalysisResult } from "@/components/AIAnalysis";
import ExportTile from "@/components/ExportTile";

type TileClientProps = {
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
    repoName: string;
    prNumber: string;
  };
  prDataForAI: {
    title: string;
    patches: { filename: string; patch: string }[];
    additions: number;
    deletions: number;
  };
};

export default function TileClient({ tileData, prDataForAI }: TileClientProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Merge AI analysis with tile data for export
  const exportData = {
    ...tileData,
    summary: aiAnalysis?.summary,
    impactStatement: aiAnalysis?.impactStatement,
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <AIAnalysis prData={prDataForAI} onAnalysisComplete={setAiAnalysis} />

      {/* Export Options */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-bold text-lg text-slate-200 mb-4">📤 Share Your Work</h3>
        <ExportTile tileData={exportData} />
        <p className="text-slate-500 text-sm mt-3">
          {aiAnalysis 
            ? "✓ AI analysis included in export" 
            : "Run AI analysis first to include summary & impact in your export"}
        </p>
      </div>
    </div>
  );
}