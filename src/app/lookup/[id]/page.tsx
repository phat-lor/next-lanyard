"use client";

import { useParams } from "next/navigation";
import { DiscordPresence } from "@/components/DiscordPresence";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LookupPage() {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
        if (!response.ok) {
          throw new Error('User not found or Lanyard API error');
        }
        await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to lookup</span>
          </Link>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"
          >
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6"
          >
            <div className="bg-zinc-900 rounded-xl shadow-xl ring-1 ring-white/10 overflow-hidden">
              <DiscordPresence userId={id as string} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 