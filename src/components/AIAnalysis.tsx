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

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

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
    low: "text-green-400 bg-green-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    high: "text-red-400 bg-red-400/10",
  };

  if (!analysis && !loading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-lg text-purple-200">AI-Powered Analysis</h3>
        </div>
        <p className="text-slate-300 text-sm mb-4">
          Get an AI-generated summary, impact statement, and skill detection for this PR.
        </p>
        <button
          onClick={runAnalysis}
          className="px-5 py-2.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
        >
          ✨ Analyze with AI
        </button>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"></div>
          <span className="text-purple-200">Analyzing code changes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="font-bold text-lg text-purple-200">AI Analysis</h3>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${complexityColors[analysis!.complexity]}`}>
          {analysis!.complexity} complexity
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-1">Summary</h4>
          <p className="text-slate-200">{analysis!.summary}</p>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4">
          <h4 className="text-xs uppercase tracking-wider text-sky-400 mb-1">💡 Impact Statement</h4>
          <p className="text-sky-100 font-medium">{analysis!.impactStatement}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Skills Detected</h4>
          <div className="flex flex-wrap gap-2">
            {analysis!.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <span className="text-xs text-slate-500">
            Category: <span className="text-slate-400 capitalize">{analysis!.category}</span>
          </span>
        </div>
      </div>
    </div>
  );
}