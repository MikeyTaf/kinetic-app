import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      {/* Hero */}
      <div className="mb-4 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
        ✨ AI-Powered Portfolio Builder
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
        <span className="bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Kinetic
        </span>
      </h1>
      
      <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-400">
        Turn your real GitHub work into verifiable <strong className="text-slate-200">Proof Tiles</strong> that showcase your trajectory, not just a static résumé.
      </p>

      <div className="mt-10">
        <Link
          href="/api/auth/signin"
          className="inline-block px-10 py-4 rounded-lg bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all duration-300 transform hover:scale-105"
        >
          Sign in with GitHub
        </Link>
      </div>

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-left">
          <div className="text-2xl mb-2">🤖</div>
          <h3 className="font-bold text-slate-200 mb-2">AI Analysis</h3>
          <p className="text-slate-400 text-sm">
            Get AI-generated summaries, impact statements, and skill detection for every PR.
          </p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-left">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-bold text-slate-200 mb-2">Smart Scoring</h3>
          <p className="text-slate-400 text-sm">
            Craft, Collaboration, and Velocity signals that actually measure developer impact.
          </p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-left">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-bold text-slate-200 mb-2">Shareable Tiles</h3>
          <p className="text-slate-400 text-sm">
            Export beautiful proof tiles for LinkedIn, portfolios, and job applications.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-20 max-w-2xl">
        <h2 className="text-2xl font-bold text-slate-200 mb-6">How it works</h2>
        <div className="space-y-4 text-left">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-slate-200">Connect GitHub</h3>
              <p className="text-slate-400 text-sm">Sign in to access your repositories and pull requests</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-slate-200">Generate Proof Tiles</h3>
              <p className="text-slate-400 text-sm">Select PRs and let AI analyze your contributions</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-slate-200">Share Your Work</h3>
              <p className="text-slate-400 text-sm">Export tiles to LinkedIn, your portfolio, or applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-slate-600 text-sm">
        Built for developers who ship real code
      </footer>
    </main>
  );
}