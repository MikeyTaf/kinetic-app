"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Repo = {
  full_name: string;
};
type PR = {
  number: number;
  title: string;
};

export default function Dashboard() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [prs, setPRs] = useState<PR[]>([]);
  const [isLoading, setIsLoading] = useState({ repos: true, prs: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      setIsLoading(prev => ({ ...prev, repos: true }));
      try {
        const response = await fetch("/api/github/repos");
        if (!response.ok) throw new Error("Failed to fetch repos.");
        const data = await response.json();
        setRepos(data);
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(prev => ({ ...prev, repos: false })); }
    }
    fetchRepos();
  }, []);

  async function handleSelectRepo(repoFullName: string) {
    setSelectedRepo(repoFullName);
    setPRs([]);
    setIsLoading(prev => ({ ...prev, prs: true }));
    setError(null);
    try {
      const response = await fetch(`/api/github/prs?repo=${encodeURIComponent(repoFullName)}`);
      if (!response.ok) throw new Error("Failed to fetch pull requests.");
      const data = await response.json();
      setPRs(data);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(prev => ({ ...prev, prs: false })); }
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-4xl font-bold text-slate-100">Dashboard</h1>
        <a href="/api/auth/signout" className="text-red-500 hover:underline">Sign Out</a>
      </header>

      {error && <p className="text-red-400 mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">Error: {error}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="font-bold text-xl mb-4 text-slate-200">1. Select a Repository</h2>
          <div className="border border-slate-700 rounded-lg max-h-[60vh] overflow-y-auto">
            {isLoading.repos && <p className="p-4 text-slate-400">Loading repositories...</p>}
            <ul>
              {repos.map(repo => (
                <li key={repo.full_name} className="flex justify-between items-center p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors">
                  <span className="text-sm truncate mr-2">{repo.full_name}</span>
                  <button onClick={() => handleSelectRepo(repo.full_name)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${selectedRepo === repo.full_name ? 'bg-sky-500 text-white ring-2 ring-sky-400' : 'bg-slate-600 text-slate-200 hover:bg-slate-500'}`}>
                    Select
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lg:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="font-bold text-xl mb-4 text-slate-200">2. Choose a Pull Request</h2>
          <div className="border border-slate-700 rounded-lg min-h-[60vh]">
            {!selectedRepo && <p className="p-6 text-slate-400">Please select a repository to see its pull requests.</p>}
            {isLoading.prs && <p className="p-6 text-slate-400">Loading pull requests...</p>}
            {prs.length === 0 && selectedRepo && !isLoading.prs && <p className="p-6 text-slate-400">No closed pull requests found in this repository.</p>}
            <ul className="divide-y divide-slate-700">
              {prs.map(pr => (
                <li key={pr.number} className="p-4 hover:bg-slate-700/50 transition-colors">
                  <div className="font-semibold text-slate-100">{pr.title}</div>
                  <div className="text-xs text-slate-400 mt-1">PR #{pr.number}</div>
                  <Link href={`/tile/${selectedRepo}/${pr.number}`} className="inline-block mt-3 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 text-slate-900 hover:bg-white transition-colors transform hover:scale-105">
                    Generate Proof Tile
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}