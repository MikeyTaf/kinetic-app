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

  const complexityColors = {
    low: "text-emerald-400 bg-emerald-500/10",
    medium: "text-amber-400 bg-amber-500/10",
    high: "text-red-400 bg-red-500/10",
  };

  if (!analysis && !loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">AI Analysis</h3>
            <p className="text-xs text-zinc-500">Generate insights from code</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          Get an AI-powered summary, impact statement, and skill detection for this PR.
        </p>
        <button
          onClick={runAnalysis}
          className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
        >
          Analyze with AI
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="font-medium">Analyzing code...</p>
            <p className="text-xs text-zinc-500">Reading diffs and generating insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Analysis Complete</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs ${complexityColors[analysis!.complexity]}`}>
          {analysis!.complexity} complexity
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs text-zinc-500 uppercase mb-1">Summary</h4>
          <p className="text-sm text-zinc-300">{analysis!.summary}</p>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <h4 className="text-xs text-cyan-400 uppercase mb-1">Impact</h4>
          <p className="text-sm text-zinc-200">{analysis!.impactStatement}</p>
        </div>
        <div>
          <h4 className="text-xs text-zinc-500 uppercase mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis!.skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
