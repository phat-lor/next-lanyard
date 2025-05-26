"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useLanyard } from '../hooks/useLanyard';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscordSkeleton } from './DiscordSkeleton';
import { Activity } from '../types/lanyard.type';

const PLATFORM_ICONS = {
  desktop: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
        <path d="M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z" />
      </svg>
    ),
  },
  mobile: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1500" className="w-5 h-5" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
        <path d="M 187 0 L 813 0 C 916.277 0 1000 83.723 1000 187 L 1000 1313 C 1000 1416.277 916.277 1500 813 1500 L 187 1500 C 83.723 1500 0 1416.277 0 1313 L 0 187 C 0 83.723 83.723 0 187 0 Z M 125 1000 L 875 1000 L 875 250 L 125 250 Z M 500 1125 C 430.964 1125 375 1180.964 375 1250 C 375 1319.036 430.964 1375 500 1375 C 569.036 1375 625 1319.036 625 1250 C 625 1180.964 569.036 1125 500 1125 Z" />
      </svg>
    ),
  },
} as const;

interface DiscordPresenceProps {
  userId: string;
}

export function DiscordPresence({ userId }: DiscordPresenceProps) {
  const { data, loading, error, debugInfo } = useLanyard({ userId });
  const [activityTimes, setActivityTimes] = useState<{ [key: number]: number }>({});
  const [delayedPlatformIndicator, setDelayedPlatformIndicator] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const currentBannerUrl = useRef<string | null>(null);

  useEffect(() => {
    if (data?.active_on_discord_mobile) {
      const timer = setTimeout(() => {
        setDelayedPlatformIndicator('mobile');
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setDelayedPlatformIndicator(data?.active_on_discord_desktop ? 'desktop' : null);
    }
  }, [data?.active_on_discord_mobile, data?.active_on_discord_desktop]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (data?.activities?.length) {
      interval = setInterval(() => {
        const now = Date.now();
        const newTimes: { [key: number]: number } = {};

        data.activities
          .filter((activity) => activity.type !== 2 && activity.name !== "Custom Status")
          .forEach((activity: Activity, index: number) => {
            if (activity.timestamps?.start) {
              newTimes[index] = now - activity.timestamps.start;
            }
          });

        setActivityTimes(newTimes);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [data?.activities]);

  useEffect(() => {
    if (!data?.spotify) return;

    const updateProgress = () => {
      const start = data.spotify?.timestamps?.start || 0;
      const end = data.spotify?.timestamps?.end || 0;
      const now = Date.now();
      const total = end - start;
      const current = now - start;
      
      setProgress((current / total) * 100);
      setCurrentTime(current);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [data?.spotify]);

  useEffect(() => {
    if (data?.discord_user?.id) {
      const bannerUrl = `https://dcdn.dstn.to/banners/${data.discord_user.id}?size=1024`;

      if (bannerUrl !== currentBannerUrl.current) {
        currentBannerUrl.current = bannerUrl;
        setIsBannerLoaded(false);
        fetch(bannerUrl)
          .then((response) => {
            if (response.ok) {
              setBannerUrl(bannerUrl);
            } else {
              setBannerUrl(null);
            }
          })
          .catch(() => setBannerUrl(null));
      }
    }
  }, [data?.discord_user?.id]);

  const getActivityImageUrl = (activity: Activity) => {
    if (!activity.assets?.large_image) {
      return `https://dcdn.dstn.to/app-icons/${activity.application_id}?size=1024`;
    }

    const { large_image } = activity.assets;

    if (large_image.startsWith("mp:external/")) {
      const processedUrl = large_image.split("/").slice(2).join("/");
      return processedUrl.startsWith("https/") ? `https://${processedUrl.slice(6)}` : processedUrl;
    }

    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${large_image}.png`;
  };

  const getActivitySmallImageUrl = (activity: Activity) => {
    if (!activity.assets?.small_image) return null;

    const { small_image } = activity.assets;

    if (small_image.startsWith("mp:external/")) {
      const processedUrl = small_image.split("/").slice(2).join("/");
      return processedUrl.startsWith("https/") ? `https://${processedUrl.slice(6)}` : processedUrl;
    }

    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${small_image}.png`;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  if (loading) {
    return <DiscordSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 text-red-500 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            <p className="font-medium">{error.message}</p>
          </div>
          
          {/* Debug Information */}
          <div className="mt-2 text-sm bg-black/20 rounded-lg p-3 font-mono">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-red-400">Error Code:</span>
              <span>{error.code || 'UNKNOWN'}</span>
              
              <span className="text-red-400">Endpoint:</span>
              <span className="break-all">{error.endpoint || 'N/A'}</span>
              
              {error.statusCode && (
                <>
                  <span className="text-red-400">Status Code:</span>
                  <span>{error.statusCode}</span>
                </>
              )}
            </div>
            
            {error.details && (
              <div className="mt-3 border-t border-red-500/20 pt-3">
                <p className="text-red-400 mb-2">Additional Details:</p>
                <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-500/10 text-yellow-500 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            <p>No data available for this user ID</p>
          </div>
          
          {debugInfo && (
            <div className="mt-2 text-sm bg-black/20 rounded-lg p-3 font-mono">
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-yellow-400">User ID:</span>
                <span>{userId}</span>
                
                <span className="text-yellow-400">Connection:</span>
                <span className="text-yellow-300 capitalize">{debugInfo.connectionType}</span>
                
                <span className="text-yellow-400">Last Attempt:</span>
                <span>{new Date(debugInfo.lastAttempt).toLocaleString()}</span>
                
                <span className="text-yellow-400">Endpoint:</span>
                <span className="break-all">{debugInfo.lastEndpoint}</span>
              </div>
              
              {debugInfo.lastResponse && (
                <div className="mt-3 border-t border-yellow-500/20 pt-3">
                  <p className="text-yellow-400 mb-2">Last Response:</p>
                  <pre className="text-xs overflow-auto h-56 whitespace-pre-wrap">
                    {JSON.stringify(debugInfo.lastResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ensure discord_user exists
  if (!data.discord_user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-500/10 text-yellow-500 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            <p>Invalid user data received</p>
          </div>
          
          <div className="mt-2 text-sm bg-black/20 rounded-lg p-3 font-mono">
            <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Get avatar URL with fallback
  const avatarUrl = data.discord_user.avatar 
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${Number(data.discord_user.discriminator) % 5}.png`;

  return (
    <div className={`bg-zinc-900 rounded-lg p-4 font-mono text-sm relative overflow-hidden ${
      bannerUrl ? 'bg-black/90' : ''
    }`}>
      {bannerUrl && (
        <>
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isBannerLoaded ? 'opacity-40' : 'opacity-0'
            }`}
            style={{
              backgroundImage: isBannerLoaded ? `url(${bannerUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.7)',
              transform: 'scale(1.2)',
              zIndex: 0,
              backgroundColor: 'transparent',
            }}
            aria-hidden="true"
          >
            <Image
              src={bannerUrl}
              alt="User Banner"
              width={500}
              height={500}
              className="hidden"
              onLoad={() => setIsBannerLoaded(true)}
              priority
              unoptimized
            />
          </div>
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md z-[1]"
            aria-hidden="true"
          />
          {!isBannerLoaded && !loading && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(to right, rgb(39 39 42 / 0.3), rgb(63 63 70 / 0.3), rgb(39 39 42 / 0.3))',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
              aria-hidden="true"
            />
          )}
        </>
      )}
      <div className="space-y-4 relative z-10">
        {/* User Info with Platform Indicator */}
        <DebugSection title="Discord User">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Image
                src={avatarUrl}
                alt={data.discord_user.username || 'Unknown User'}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-white/10"
              />
              {data.discord_user.avatar_decoration_data && (
                <Image
                  src={`https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png`}
                  alt="Avatar Decoration"
                  width={96}
                  height={96}
                  className="absolute -inset-2 pointer-events-none"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))' }}
                />
              )}
              <AnimatePresence mode="wait">
                {delayedPlatformIndicator && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`absolute bottom-0 right-0 bg-zinc-800/90 rounded-full p-1 ${bannerUrl ? 'bg-black/60 backdrop-blur-sm ring-1 ring-white/10' : ''}`}
                  >
                    {PLATFORM_ICONS[delayedPlatformIndicator as keyof typeof PLATFORM_ICONS]?.icon}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                  {data.discord_user.global_name || data.discord_user.username || 'Unknown User'}
                </h3>
                {data.discord_user.clan?.identity_enabled && (
                  <span className={`text-xs font-medium ${bannerUrl ? 'text-zinc-200 bg-black/50 backdrop-blur-sm ring-1 ring-white/10' : 'text-zinc-400 bg-zinc-800/50'} px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm`}>
                    <Image
                      src={`https://cdn.discordapp.com/clan-badges/${data.discord_user.clan.identity_guild_id}/${data.discord_user.clan.badge}.png`}
                      alt={data.discord_user.clan.tag}
                      width={16}
                      height={16}
                      className="inline-block"
                    />
                    {data.discord_user.clan.tag}
                  </span>
                )}
              </div>
              <p className={`text-sm ${bannerUrl ? 'text-zinc-300' : 'text-zinc-400'}`}>
                @{data.discord_user.username || 'unknown'}
              </p>
              <DebugItem label="Status" value={data.discord_status || 'unknown'} />
            </div>
          </div>
          <div className={`mt-4 space-y-1 ${bannerUrl ? 'bg-black/40 backdrop-blur-sm p-3 rounded-lg ring-1 ring-white/10' : ''}`}>
            <DebugItem label="ID" value={data.discord_user.id || 'N/A'} />
            <DebugItem label="Discriminator" value={data.discord_user.discriminator || 'N/A'} />
            {data.discord_user.banner && (
              <DebugItem label="Banner" value={bannerUrl || 'Loading...'} />
            )}
            {data.discord_user.clan?.identity_enabled && (
              <>
                <DebugItem label="Clan Tag" value={data.discord_user.clan.tag} />
                <DebugItem label="Clan Badge" value={data.discord_user.clan.badge} />
                <DebugItem label="Clan Guild ID" value={data.discord_user.clan.identity_guild_id} />
              </>
            )}
          </div>
        </DebugSection>

        {/* Status Section */}
        <DebugSection title="Status">
          <DebugItem label="Discord Status" value={data.discord_status || 'unknown'} />
          <DebugItem label="Desktop Active" value={data.active_on_discord_desktop ? 'Yes' : 'No'} />
          <DebugItem label="Mobile Active" value={data.active_on_discord_mobile ? 'Yes' : 'No'} />
        </DebugSection>

        {/* Spotify Section */}
        {data.spotify && (
          <DebugSection title="Spotify">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-800 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                {data.spotify.album_art_url && (
                  <Image
                    src={data.spotify.album_art_url}
                    alt={data.spotify.album || "Album Art"}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-medium">{data.spotify.song}</h4>
                  <p className="text-zinc-300 text-sm">by {data.spotify.artist}</p>
                  <p className="text-zinc-400 text-sm">on {data.spotify.album}</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-zinc-700 rounded-full h-1">
                      <div
                        className="h-1 bg-[#1DB954] rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(data.spotify.timestamps.end - data.spotify.timestamps.start)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-700">
                <DebugItem label="Track ID" value={data.spotify.track_id} />
                <DebugItem label="Album Art URL" value={data.spotify.album_art_url || 'None'} />
                <DebugItem label="Start Time" value={new Date(data.spotify.timestamps.start).toISOString()} />
                <DebugItem label="End Time" value={new Date(data.spotify.timestamps.end).toISOString()} />
              </div>
            </motion.div>
          </DebugSection>
        )}

        {/* Activities with Images and Timestamps */}
        <DebugSection title="Activities">
          {data.activities
            .filter(activity => activity.type !== 2 && activity.type !== 4)
            .map((activity, index) => (
              <motion.div
                key={activity.application_id || activity.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-800 rounded-lg p-4 mb-4"
              >
                <div className="flex items-start gap-4">
                  {/* Activity Image */}
                  <div className="relative">
                    <Image
                      src={getActivityImageUrl(activity)}
                      alt={activity.name}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    {activity.assets?.small_image && (
                      <div className="absolute -bottom-2 -right-2">
                        <Image
                          src={getActivitySmallImageUrl(activity) || ''}
                          alt={activity.assets.small_text || "Status"}
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-zinc-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{activity.name}</h4>
                    {activity.details && (
                      <p className="text-zinc-300 text-sm">{activity.details}</p>
                    )}
                    {activity.state && (
                      <p className="text-zinc-400 text-sm">{activity.state}</p>
                    )}
                    {activity.timestamps?.start && (
                      <p className="text-zinc-500 text-xs mt-2">
                        {(() => {
                          const elapsed = activityTimes[index] ? Math.floor(activityTimes[index] / 1000) : 0;
                          const hours = Math.floor(elapsed / 3600);
                          const minutes = Math.floor((elapsed % 3600) / 60);
                          const seconds = elapsed % 60;
                          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} elapsed`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Debug Information */}
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <DebugItem label="Activity ID" value={activity.application_id || 'N/A'} />
                  <DebugItem label="Type" value={activity.type.toString()} />
                  {activity.assets?.large_image && (
                    <DebugItem label="Large Image" value={activity.assets.large_image} />
                  )}
                  {activity.assets?.small_image && (
                    <DebugItem label="Small Image" value={activity.assets.small_image} />
                  )}
                </div>
              </motion.div>
            ))}
        </DebugSection>

        {/* Raw Data */}
        <DebugSection title="Raw Data">
          <pre className="bg-zinc-950 p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </DebugSection>

        {/* Discord URLs and Resources */}
        <DebugSection title="Discord URLs & Resources">
          <div className="space-y-4">
            {/* Profile URLs */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Profile URLs</h4>
              <div className="space-y-1">
                <DebugItem 
                  label="Profile" 
                  value={`https://discord.com/users/${data.discord_user.id}`} 
                />
                <DebugItem 
                  label="Avatar" 
                  value={avatarUrl} 
                />
                {data.discord_user.banner && (
                  <DebugItem 
                    label="Banner" 
                    value={`https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.png`} 
                  />
                )}
                {data.discord_user.avatar_decoration_data && (
                  <DebugItem 
                    label="Decoration" 
                    value={`https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png`} 
                  />
                )}
              </div>
            </div>

            {/* User Details */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">User Details</h4>
              <div className="space-y-1">
                <DebugItem 
                  label="User ID" 
                  value={data.discord_user.id} 
                />
                <DebugItem 
                  label="Username" 
                  value={data.discord_user.username} 
                />
                <DebugItem 
                  label="Global Name" 
                  value={data.discord_user.global_name || 'Not set'} 
                />
                <DebugItem 
                  label="Discriminator" 
                  value={data.discord_user.discriminator || '0'} 
                />
                <DebugItem 
                  label="Full Tag" 
                  value={`${data.discord_user.username}#${data.discord_user.discriminator}`} 
                />
                <DebugItem 
                  label="Display Name" 
                  value={data.discord_user.global_name || data.discord_user.username} 
                />
              </div>
            </div>

            {/* Assets */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Asset Details</h4>
              <div className="space-y-1">
                <DebugItem 
                  label="Avatar Hash" 
                  value={data.discord_user.avatar || 'Default avatar'} 
                />
                <DebugItem 
                  label="Banner Hash" 
                  value={data.discord_user.banner || 'No banner'} 
                />
                <DebugItem 
                  label="Banner Color" 
                  value={data.discord_user.banner_color || 'Not set'} 
                />
                {data.discord_user.avatar_decoration_data && (
                  <>
                    <DebugItem 
                      label="Decoration Asset" 
                      value={data.discord_user.avatar_decoration_data.asset} 
                    />
                    <DebugItem 
                      label="Decoration SKU ID" 
                      value={data.discord_user.avatar_decoration_data.sku_id} 
                    />
                  </>
                )}
              </div>
            </div>

            {/* Alternative Formats */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Alternative Formats</h4>
              <div className="space-y-1">
                {data.discord_user.avatar && (
                  <>
                    <DebugItem 
                      label="Avatar (GIF)" 
                      value={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.gif`} 
                    />
                    <DebugItem 
                      label="Avatar (WebP)" 
                      value={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp`} 
                    />
                    <DebugItem 
                      label="Avatar (JPEG)" 
                      value={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.jpg`} 
                    />
                  </>
                )}
                {data.discord_user.banner && (
                  <>
                    <DebugItem 
                      label="Banner (GIF)" 
                      value={`https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.gif`} 
                    />
                    <DebugItem 
                      label="Banner (WebP)" 
                      value={`https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.webp`} 
                    />
                    <DebugItem 
                      label="Banner (JPEG)" 
                      value={`https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.jpg`} 
                    />
                  </>
                )}
                <DebugItem 
                  label="Default Avatar" 
                  value={`https://cdn.discordapp.com/embed/avatars/${Number(data.discord_user.discriminator) % 5}.png`} 
                />
              </div>
            </div>

            {/* Clan/Identity Info */}
            {data.discord_user.clan?.identity_enabled && (
              <div>
                <h4 className="text-zinc-300 font-medium mb-2">Clan/Identity Info</h4>
                <div className="space-y-1">
                  <DebugItem 
                    label="Clan Tag" 
                    value={data.discord_user.clan.tag} 
                  />
                  <DebugItem 
                    label="Badge URL" 
                    value={`https://cdn.discordapp.com/clan-badges/${data.discord_user.clan.identity_guild_id}/${data.discord_user.clan.badge}.png`} 
                  />
                  <DebugItem 
                    label="Guild ID" 
                    value={data.discord_user.clan.identity_guild_id} 
                  />
                </div>
              </div>
            )}

            {/* Lanyard API URLs */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Lanyard API URLs</h4>
              <div className="space-y-1">
                <DebugItem 
                  label="REST API" 
                  value={`https://api.lanyard.rest/v1/users/${data.discord_user.id}`} 
                />
                <DebugItem 
                  label="WebSocket" 
                  value="wss://api.lanyard.rest/socket" 
                />
                <DebugItem 
                  label="Avatar API" 
                  value={`https://api.lanyard.rest/${data.discord_user.id}.png`} 
                />
              </div>
            </div>
          </div>
        </DebugSection>

        {/* Connection Debug Info */}
        <DebugSection title="Connection Debug">
          <div className="space-y-2">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">Connection:</span>
              <span className="text-zinc-300 capitalize">{debugInfo.connectionType}</span>

              <span className="text-zinc-500">Last Attempt:</span>
              <span className="text-zinc-300">{new Date(debugInfo.lastAttempt).toLocaleString()}</span>

              <span className="text-zinc-500">Attempts:</span>
              <span className="text-zinc-300">{debugInfo.attempts}</span>

              <span className="text-zinc-500">Endpoint:</span>
              <span className="text-zinc-300 break-all">{debugInfo.lastEndpoint}</span>
            </div>

            {debugInfo.lastResponse && (
              <div className="mt-3 border-t border-zinc-800 pt-3">
                <p className="text-zinc-500 mb-2">Last Response:</p>
                <pre className="text-xs bg-zinc-950 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.lastResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DebugSection>
      </div>
    </div>
  );
}

function DebugSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-3">
      <h3 className="text-zinc-300 font-bold mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DebugItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px,1fr] gap-2">
      <span className="text-zinc-500">{label}:</span>
      <span className="text-zinc-300 break-all">{value}</span>
    </div>
  );
} 