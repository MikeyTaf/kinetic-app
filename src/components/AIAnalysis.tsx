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

  const complexityConfig = {
    low: { color: "#00ff88", bg: "rgba(0, 255, 136, 0.1)", label: "Low Complexity" },
    medium: { color: "#ffcc00", bg: "rgba(255, 204, 0, 0.1)", label: "Medium Complexity" },
    high: { color: "#ff4466", bg: "rgba(255, 68, 102, 0.1)", label: "High Complexity" },
  };

  if (!analysis && !loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ff6b35] opacity-20" />
        <div className="absolute inset-[1px] bg-[#151520] rounded-2xl" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#00f0ff]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-semibold text-lg">AI Analysis</h3>
              <p className="text-xs text-[#55556a] font-['JetBrains_Mono']">powered by llm</p>
            </div>
          </div>
          <p className="text-[#8888a0] text-sm mb-6">Generate an AI-powered summary, impact statement, and skill detection for this PR.</p>
          <button
            onClick={runAnalysis}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#00f0ff] text-black font-semibold hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300"
          >
            Analyze with AI
          </button>
          {error && <p className="mt-4 text-sm text-[#ff4466] font-['JetBrains_Mono']">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] p-6">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#00f0ff] animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-[2px] rounded-xl bg-[#151520] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
            </div>
          </div>
          <div>
            <p className="font-['Space_Grotesk'] font-semibold">Analyzing code...</p>
            <p className="text-xs text-[#55556a] font-['JetBrains_Mono']">reading diffs and generating insights</p>
          </div>
        </div>
      </div>
    );
  }

  const config = complexityConfig[analysis!.complexity];

  return (
    <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7]/20 to-[#00f0ff]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-['Space_Grotesk'] font-semibold">AI Analysis Complete</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold font-['JetBrains_Mono']" style={{ background: config.bg, color: config.color }}>
          {config.label}
        </span>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-[#55556a] font-['JetBrains_Mono'] mb-2">Summary</h4>
          <p className="text-[#f0f0f5] leading-relaxed">{analysis!.summary}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#00f0ff]/10 to-[#a855f7]/10 border border-[#00f0ff]/20">
          <h4 className="text-xs uppercase tracking-wider text-[#00f0ff] font-['JetBrains_Mono'] mb-2">Impact Statement</h4>
          <p className="text-[#f0f0f5] font-medium">{analysis!.impactStatement}</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-[#55556a] font-['JetBrains_Mono'] mb-3">Skills Detected</h4>
          <div className="flex flex-wrap gap-2">
            {analysis!.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-sm text-[#f0f0f5] font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-[#2a2a3a]">
          <span className="text-xs text-[#55556a] font-['JetBrains_Mono']">
            Category: <span className="text-[#8888a0] capitalize">{analysis!.category}</span>
          </span>
        </div>
      </div>
    </div>
  );
}