"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

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
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header currentPage="dashboard" />

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">Select a PR to analyze</h1>
          <p className="text-sm text-neutral-500">Choose a repository, then pick a pull request to generate your proof tile.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Repos */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Repositories</span>
              <span className="text-xs text-neutral-500">{repos.length}</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading.repos ? (
                <div className="p-6 text-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Loading...</p>
                </div>
              ) : repos.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-sm">
                  No repositories found
                </div>
              ) : (
                <div className="p-1.5">
                  {repos.map((repo) => (
                    <button
                      key={repo.full_name}
                      onClick={() => handleSelectRepo(repo.full_name)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedRepo === repo.full_name
                          ? "bg-white text-black"
                          : "text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      {repo.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PRs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Pull Requests</span>
              <span className="text-xs text-neutral-500">
                {selectedRepo ? prs.length : "—"}
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {!selectedRepo ? (
                <div className="p-6 text-center text-neutral-500 text-sm">
                  Select a repository first
                </div>
              ) : isLoading.prs ? (
                <div className="p-6 text-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Loading...</p>
                </div>
              ) : prs.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-sm">
                  No closed PRs found
                </div>
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {prs.map((pr) => (
                    <Link
                      key={pr.number}
                      href={`/tile/${selectedRepo}/${pr.number}`}
                      className="block px-3 py-2.5 rounded hover:bg-neutral-800 transition-colors group"
                    >
                      <p className="text-sm text-neutral-200 group-hover:text-white line-clamp-1 mb-0.5">
                        {pr.title}
                      </p>
                      <p className="text-xs text-neutral-600">#{pr.number}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
