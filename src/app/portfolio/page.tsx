"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Repo = { full_name: string };
type PR = { number: number; title: string };
type PortfolioItem = { repo: string; pr: PR };

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
      const reposToLoad = repos.slice(0, 5);
      for (const repo of reposToLoad) {
        try {
          const prs = await fetcher(`/api/github/prs?repo=${repo.full_name}`);
          for (const pr of prs.slice(0, 5)) {
            items.push({ repo: repo.full_name, pr });
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

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <span className="text-zinc-950 font-bold text-sm">K</span>
              </div>
              <span className="font-semibold">Kinetic</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 text-sm">Portfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button onClick={() => signOut()} className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Portfolio</h1>
          <p className="text-zinc-400">Your collection of proof tiles.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold">{repos.length}</div>
            <div className="text-sm text-zinc-500">Repositories</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-cyan-400">{portfolioItems.length}</div>
            <div className="text-sm text-zinc-500">PRs Loaded</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-violet-400">
              {new Set(portfolioItems.map((i) => i.repo)).size}
            </div>
            <div className="text-sm text-zinc-500">Active Projects</div>
          </div>
        </div>

        {/* Load button or grid */}
        {portfolioItems.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <h2 className="font-semibold mb-2">Build Your Portfolio</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Load your recent PRs to create a collection of proof tiles.
            </p>
            <button
              onClick={loadAllPRs}
              disabled={loading || loadingPRs || repos.length === 0}
              className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingPRs ? "Loading..." : loading ? "Loading repos..." : "Load My PRs"}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioItems.map((item, i) => (
              <Link
                key={i}
                href={`/tile/${item.repo}/${item.pr.number}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group"
              >
                <p className="text-xs text-zinc-500 font-mono mb-1">{item.repo}</p>
                <p className="text-sm text-zinc-200 line-clamp-2 mb-2 group-hover:text-white transition-colors">
                  {item.pr.title}
                </p>
                <p className="text-xs text-zinc-500">#{item.pr.number}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
