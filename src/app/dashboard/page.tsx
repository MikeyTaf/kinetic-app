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
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center">
                <span className="text-black font-bold text-sm">K</span>
              </div>
              <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight hidden sm:block">kinetic</span>
            </Link>
            <div className="h-6 w-px bg-[#2a2a3a]" />
            <span className="text-[#8888a0] text-sm font-['JetBrains_Mono']">dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="text-sm text-[#8888a0] hover:text-[#00f0ff] transition-colors font-medium">
              Portfolio
            </Link>
            <button onClick={() => signOut()} className="text-sm text-[#ff4466] hover:text-[#ff6b35] transition-colors font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold">Select a PR to analyze</h1>
          <p className="mt-2 text-[#8888a0]">Choose a repository, then pick a pull request to generate your proof tile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#ff4466]/10 border border-[#ff4466]/30 text-[#ff4466] animate-fade-in">
            <span className="font-['JetBrains_Mono'] text-sm">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 animate-fade-in animate-delay-1">
            <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-['Space_Grotesk'] font-semibold">Repositories</h2>
                    <p className="text-xs text-[#55556a] font-['JetBrains_Mono']">{repos.length} found</p>
                  </div>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading.repos ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                    <p className="mt-3 text-sm text-[#55556a]">Loading repos...</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {repos.map((repo) => (
                      <button
                        key={repo.full_name}
                        onClick={() => handleSelectRepo(repo.full_name)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                          selectedRepo === repo.full_name
                            ? "bg-gradient-to-r from-[#00f0ff]/20 to-[#a855f7]/10 border border-[#00f0ff]/30"
                            : "hover:bg-[#1a1a25] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium truncate ${selectedRepo === repo.full_name ? "text-[#00f0ff]" : "text-[#f0f0f5] group-hover:text-[#00f0ff]"}`}>
                            {repo.full_name}
                          </span>
                          <svg className={`w-4 h-4 transition-all ${selectedRepo === repo.full_name ? "text-[#00f0ff] translate-x-0 opacity-100" : "text-[#55556a] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 animate-fade-in animate-delay-2">
            <div className="rounded-2xl bg-[#151520] border border-[#2a2a3a] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-['Space_Grotesk'] font-semibold">Pull Requests</h2>
                    <p className="text-xs text-[#55556a] font-['JetBrains_Mono']">{selectedRepo ? `${prs.length} closed PRs` : "select a repo"}</p>
                  </div>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {!selectedRepo ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#55556a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                    </div>
                    <p className="text-[#55556a]">Select a repository to view PRs</p>
                  </div>
                ) : isLoading.prs ? (
                  <div className="p-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
                    <p className="mt-3 text-sm text-[#55556a]">Loading pull requests...</p>
                  </div>
                ) : prs.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-[#55556a]">No closed PRs found</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {prs.map((pr) => (
                      <div key={pr.number} className="group p-4 rounded-xl bg-[#1a1a25]/50 border border-transparent hover:border-[#a855f7]/30 hover:bg-[#1a1a25] transition-all duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#f0f0f5] group-hover:text-white transition-colors line-clamp-2">{pr.title}</h3>
                            <p className="mt-1 text-xs text-[#55556a] font-['JetBrains_Mono']">#{pr.number}</p>
                          </div>
                          <Link
                            href={`/tile/${selectedRepo}/${pr.number}`}
                            className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                          >
                            Generate Tile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#00f0ff]/5 to-[#a855f7]/5 border border-[#2a2a3a] animate-fade-in animate-delay-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-semibold text-[#f0f0f5]">Pro tip</h3>
              <p className="mt-1 text-sm text-[#8888a0]">PRs with tests, error handling, and detailed commit messages score higher. Choose your best work to showcase on LinkedIn!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}