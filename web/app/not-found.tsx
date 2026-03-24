import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-violet-400" />
          <span className="font-bold text-lg tracking-tight text-white">OpenHelix AI</span>
        </Link>

        <div className="text-8xl font-bold text-violet-500/20 mb-4">404</div>

        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-zinc-400 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}