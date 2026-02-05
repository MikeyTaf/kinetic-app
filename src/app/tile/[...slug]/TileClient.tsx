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

  const exportData = {
    ...tileData,
    summary: aiAnalysis?.summary,
    impactStatement: aiAnalysis?.impactStatement,
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <AIAnalysis prData={prDataForAI} onAnalysisComplete={setAiAnalysis} />
      <ExportTile tileData={exportData} />
    </div>
  );
}
