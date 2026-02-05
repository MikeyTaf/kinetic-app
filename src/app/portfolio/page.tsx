"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

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
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header currentPage="portfolio" />

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Portfolio</h1>
          <p className="text-sm text-neutral-500">Your collection of proof tiles.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-2xl font-semibold text-white">{repos.length}</div>
            <div className="text-xs text-neutral-500 mt-0.5">Repositories</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-2xl font-semibold text-white">{portfolioItems.length}</div>
            <div className="text-xs text-neutral-500 mt-0.5">PRs Loaded</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-2xl font-semibold text-white">
              {new Set(portfolioItems.map((i) => i.repo)).size}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">Projects</div>
          </div>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
            <p className="text-sm text-neutral-400 mb-4">
              Load your recent PRs to build your portfolio.
            </p>
            <button
              onClick={loadAllPRs}
              disabled={loading || loadingPRs || repos.length === 0}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingPRs ? "Loading..." : loading ? "Loading repos..." : "Load PRs"}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolioItems.map((item, i) => (
              <Link
                key={i}
                href={`/tile/${item.repo}/${item.pr.number}`}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
              >
                <p className="text-xs text-neutral-500 mb-1.5">{item.repo}</p>
                <p className="text-sm text-white line-clamp-2 mb-1.5">{item.pr.title}</p>
                <p className="text-xs text-neutral-600">#{item.pr.number}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
