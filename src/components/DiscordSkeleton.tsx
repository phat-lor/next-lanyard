export function DiscordSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="h-5 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>

      <div className="h-[1px] w-full bg-zinc-800" />

      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-zinc-800/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-zinc-700" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-zinc-700 rounded" />
                <div className="h-4 w-32 bg-zinc-700 rounded" />
                <div className="h-4 w-36 bg-zinc-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 