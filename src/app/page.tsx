"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const discordIdRegex = /^\d{17,20}$/;
    if (!discordIdRegex.test(userId.trim())) {
      setError("Please enter a valid Discord ID (17-20 digits)");
      return;
    }

    setIsLoading(true);
    router.push(`/lookup/${userId.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900 rounded-xl p-8 shadow-xl ring-1 ring-white/10 mb-8"
        >
          <div className="prose prose-invert max-w-none mb-8">
            <div className="space-y-6 text-start mb-8">
              <h1 className="text-3xl font-bold">
                Next.js Lanyard Integration
              </h1>
              <p className="text-zinc-400 text-sm">
                A modern example of how to integrate Discord presence in your
                Next.js application using Lanyard
              </p>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>
                This is a complete example of integrating{" "}
                <a
                  href="https://github.com/Phineas/lanyard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Lanyard
                </a>{" "}
                with Next.js
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Join the{" "}
                  <a
                    href="https://discord.gg/lanyard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Lanyard Discord server
                  </a>{" "}
                  to get your profile indexed.
                </li>
                <li>
                  Enter your/someone else&apos;s Discord user ID to view their
                  presence.
                </li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-zinc-400"
              >
                Try it out - Enter a Discord User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Discord user ID"
                className="w-full px-4 py-2.5 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors placeholder:text-zinc-500"
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Looking up...</span>
                </div>
              ) : (
                "View Presence"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-4"
        >
          <a
            href="https://github.com/phat-lor/next-lanyard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors ring-1 ring-white/10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">View Source on GitHub</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
