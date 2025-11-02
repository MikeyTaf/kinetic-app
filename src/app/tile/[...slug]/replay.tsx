"use client";

import { useState } from "react";

export default function Replay({ blockCount }: { blockCount: number }) {
  const [playing, setPlaying] = useState(false);

  const playReplay = async () => {
    setPlaying(true);
    for (let i = 0; i < blockCount; i++) {
      const el = document.getElementById(`diff-block-${i}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 5000)); 
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPlaying(false);
  };

  return (
    <button 
      onClick={playReplay} 
      disabled={playing || blockCount === 0}
      className="px-4 py-2 rounded-lg bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-600 transition-all duration-300 transform enabled:hover:scale-105"
    >
      {playing ? 'Playing...' : '▶️ Play Replay'}
    </button>
  );
}