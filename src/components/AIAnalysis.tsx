"use client";

import { useState } from "react";

type AIAnalysisProps = {
  prData: {
    title: string;
    patches: { filename: string; patch: string }[];
    additions: number;
    deletions: number;
  };
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
};

export type AIAnalysisResult = {
  summary: string;
  impactStatement: string;
  skills: string[];
  complexity: "low" | "medium" | "high";
  category: string;
};

export default function AIAnalysis({ prData, onAnalysisComplete }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prData),
      });
      if (!response.ok) throw new Error("Analysis failed");
      const result = await response.json();
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <h3 className="text-sm font-medium text-white mb-1">AI Analysis</h3>
        <p className="text-xs text-neutral-500 mb-4">Generate a summary and impact statement</p>
        <button
          onClick={runAnalysis}
          className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          Analyze
        </button>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-400">Analyzing...</span>
        </div>
      </div>
    );
  }

  const complexityColor = {
    low: "text-green-400",
    medium: "text-amber-400",
    high: "text-red-400",
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-sm font-medium text-white">AI Analysis</span>
        <span className={`text-xs ${complexityColor[analysis!.complexity]}`}>
          {analysis!.complexity} complexity
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Summary</p>
          <p className="text-sm text-neutral-300">{analysis!.summary}</p>
        </div>
        <div className="p-3 rounded bg-neutral-800">
          <p className="text-xs text-neutral-500 uppercase mb-1">Impact</p>
          <p className="text-sm text-white">{analysis!.impactStatement}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis!.skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 rounded bg-neutral-800 text-xs text-neutral-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
