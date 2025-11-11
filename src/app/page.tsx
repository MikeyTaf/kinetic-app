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
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
        {/* A vibrant, eye-catching gradient for the title */}
        <span className="bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
          Kinetic
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-400">
        Turn your real GitHub work into verifiable Proof Tiles that showcase your trajectory, not just a static résumé.
      </p>
      
      <div className="mt-10">
        <Link
          href="/api/auth/signin"
          className="inline-block px-10 py-4 rounded-lg bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all duration-300 transform hover:scale-105"
        >
          Sign in with GitHub
        </Link>
      </div>
    </main>
  );
}