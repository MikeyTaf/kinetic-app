"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Repo = {
  full_name: string;
};

type PR = {
  number: number;
  title: string;
};

type PortfolioItem = {
  repo: string;
  pr: PR;
  analyzed: boolean;
};

async function fetcher(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
  return response.json();
}

export default function PortfolioPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcher("/api/github/repos")
      .then((data) => setRepos(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadAllPRs = async () => {
    setLoadingPRs(true);
    setError(null);
    const items: PortfolioItem[] = [];

    try {
      // Load PRs from first 5 repos (to avoid rate limits)
      const reposToLoad = repos.slice(0, 5);

      for (const repo of reposToLoad) {
        try {
          const prs = await fetcher(`/api/github/prs?repo=${repo.full_name}`);
          for (const pr of prs.slice(0, 5)) {
            items.push({
              repo: repo.full_name,
              pr,
              analyzed: false,
            });
          }
        } catch {
          // Skip repos that fail
        }
      }

      setPortfolioItems(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load PRs");
    } finally {
      setLoadingPRs(false);
    }
  };

  // Calculate stats
  const totalPRs = portfolioItems.length;
  const uniqueRepos = new Set(portfolioItems.map((i) => i.repo)).size;

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-100">Portfolio</h1>
          <p className="text-slate-400 mt-1">Your proof of work collection</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-sky-400 hover:underline">
            Dashboard
          </Link>
          <button onClick={() => signOut()} className="text-red-500 hover:underline">
            Sign Out
          </button>
        </div>
      </header>

      {error && (
        <p className="text-red-400 mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          Error: {error}
        </p>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-center">
          <div className="text-3xl font-bold text-white">{repos.length}</div>
          <div className="text-sm text-slate-400">Repositories</div>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-center">
          <div className="text-3xl font-bold text-emerald-400">{totalPRs}</div>
          <div className="text-sm text-slate-400">PRs Loaded</div>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-400">{uniqueRepos}</div>
          <div className="text-sm text-slate-400">Active Projects</div>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-center">
          <div className="text-3xl font-bold text-amber-400">—</div>
          <div className="text-sm text-slate-400">Avg Score</div>
        </div>
      </div>

      {/* Load PRs Button */}
      {portfolioItems.length === 0 && (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center mb-8">
          <h2 className="text-xl font-bold text-slate-200 mb-2">Build Your Portfolio</h2>
          <p className="text-slate-400 mb-4">
            Load your recent PRs to create a collection of proof tiles.
          </p>
          <button
            onClick={loadAllPRs}
            disabled={loading || loadingPRs || repos.length === 0}
            className="px-6 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPRs ? "Loading..." : loading ? "Loading repos..." : "🚀 Load My PRs"}
          </button>
        </div>
      )}

      {/* PR Grid */}
      {portfolioItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioItems.map((item, i) => (
            <Link
              key={i}
              href={`/tile/${item.repo}/${item.pr.number}`}
              className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-sky-500 transition-all group"
            >
              <div className="text-xs text-slate-500 mb-1">{item.repo}</div>
              <h3 className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors line-clamp-2">
                {item.pr.title}
              </h3>
              <div className="text-xs text-slate-500 mt-2">PR #{item.pr.number}</div>
              <div className="mt-3 text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View Proof Tile →
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="font-bold text-lg text-slate-200 mb-3">💡 Portfolio Tips</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li>• Select your best PRs that showcase different skills</li>
          <li>• Run AI analysis on each tile to generate impact statements</li>
          <li>• Export tiles and share them on LinkedIn or your resume</li>
          <li>• PRs with tests, error handling, and good commit messages score higher</li>
        </ul>
      </div>
    </main>
  );
}