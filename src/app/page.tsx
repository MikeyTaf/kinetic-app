"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      {/* Nav */}
      <header className="h-14 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-base">K</span>
            </div>
            <span className="font-semibold text-white">Kinetic</span>
          </div>
          <button
            onClick={() => signIn("github")}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 pt-20 pb-16">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Turn your PRs into<br />proof of work
          </h1>
          <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
            Analyze your GitHub pull requests and generate shareable tiles that showcase your engineering impact.
          </p>
          <button
            onClick={() => signIn("github")}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-neutral-800">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-3 gap-10">
            <div>
              <h3 className="font-medium text-white mb-2">Quality Signals</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Craft, collaboration, and velocity scores calculated from your actual code changes.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">AI Analysis</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Auto-generated summaries and impact statements that explain what you built.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Share Anywhere</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Export tiles as HTML files or share directly to LinkedIn and portfolios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
