"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Repo = { full_name: string };
type PR = { number: number; title: string };

async function fetcher(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
  return response.json();
}

export default function Dashboard() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [prs, setPRs] = useState<PR[]>([]);
  const [isLoading, setIsLoading] = useState({ repos: true, prs: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcher("/api/github/repos")
      .then(data => setRepos(data))
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(prev => ({ ...prev, repos: false })));
  }, []);

  async function handleSelectRepo(repoFullName: string) {
    setSelectedRepo(repoFullName);
    setPRs([]);
    setIsLoading(prev => ({ ...prev, prs: true }));
    setError(null);
    try {
      const data = await fetcher(`/api/github/prs?repo=${repoFullName}`);
      setPRs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load PRs");
    } finally {
      setIsLoading(prev => ({ ...prev, prs: false }));
    }
  }

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
            <span className="text-zinc-400 text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Portfolio
            </Link>
            <button 
              onClick={() => signOut()} 
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Select a PR to analyze</h1>
          <p className="text-zinc-400">Choose a repository, then pick a pull request to generate your proof tile.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Repos panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-medium">Repositories</h2>
              <span className="text-xs text-zinc-500 font-mono">{repos.length} found</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading.repos ? (
                <div className="p-8 text-center">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Loading repositories...</p>
                </div>
              ) : repos.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No repositories found
                </div>
              ) : (
                <div className="p-2">
                  {repos.map((repo) => (
                    <button
                      key={repo.full_name}
                      onClick={() => handleSelectRepo(repo.full_name)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedRepo === repo.full_name
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {repo.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PRs panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-medium">Pull Requests</h2>
              <span className="text-xs text-zinc-500 font-mono">
                {selectedRepo ? `${prs.length} closed` : "select repo"}
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {!selectedRepo ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-500">Select a repository to view PRs</p>
                </div>
              ) : isLoading.prs ? (
                <div className="p-8 text-center">
                  <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Loading pull requests...</p>
                </div>
              ) : prs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No closed PRs found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {prs.map((pr) => (
                    <div
                      key={pr.number}
                      className="group px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-200 line-clamp-2 mb-1">{pr.title}</p>
                          <p className="text-xs text-zinc-500 font-mono">#{pr.number}</p>
                        </div>
                        <Link
                          href={`/tile/${selectedRepo}/${pr.number}`}
                          className="shrink-0 px-3 py-1.5 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 transition-all"
                        >
                          Analyze
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-8 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-300 font-medium">Tip:</span>{" "}
            PRs with tests, error handling, and detailed commit messages score higher.
          </p>
        </div>
      </main>
    </div>
  );
}
