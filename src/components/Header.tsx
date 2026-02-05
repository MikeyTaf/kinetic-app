"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type HeaderProps = {
  currentPage?: "dashboard" | "portfolio" | "tile";
};

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="h-14 border-b border-neutral-800 bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-5 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-base">K</span>
            </div>
            <span className="font-semibold text-white">Kinetic</span>
          </Link>
          
          {currentPage && (
            <>
              <span className="text-neutral-600 text-sm">/</span>
              <span className="text-neutral-400 text-sm capitalize">{currentPage === "tile" ? "Proof Tile" : currentPage}</span>
            </>
          )}
        </div>
        
        <nav className="flex items-center gap-6">
          {currentPage !== "dashboard" && (
            <Link 
              href="/dashboard" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}
          {currentPage !== "portfolio" && (
            <Link 
              href="/portfolio" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Portfolio
            </Link>
          )}
          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
