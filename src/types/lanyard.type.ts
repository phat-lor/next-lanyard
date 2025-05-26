export interface LanyardUser {
  success: boolean;
  data: LanyardData;
}

export interface LanyardData {
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  listening_to_spotify: boolean;
  kv: Record<string, string>;
  spotify: SpotifyData | null;
  discord_user: DiscordUser;
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Activity[];
}

export interface SpotifyData {
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
}

export interface DiscordUser {
  username: string;
  public_flags: number;
  id: string;
  discriminator: string;
  avatar: string;
  global_name?: string;
  banner?: string;
  banner_color?: string;
  clan?: {
    identity_enabled: boolean;
    identity_guild_id: string;
    tag: string;
    badge: string;
  };
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  };
}

export interface Activity {
  type: number;
  timestamps?: {
    start: number;
    end?: number;
  };
  sync_id?: string;
  state?: string;
  session_id?: string;
  party?: {
    id: string;
  };
  name: string;
  id: string;
  flags?: number;
  details?: string;
  created_at: number;
  assets?: {
    small_text?: string;
    small_image?: string;
    large_text?: string;
    large_image?: string;
  };
  application_id?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  op: WebSocketOpCode;
  d: WebSocketData | WebSocketInitialize | { heartbeat_interval: number } | null;
  t?: 'INIT_STATE' | 'PRESENCE_UPDATE';
  seq?: number;
}

export interface WebSocketInitialize {
  subscribe_to_ids?: string[];
  subscribe_to_id?: string;
  subscribe_to_all?: boolean;
}

export enum WebSocketOpCode {
  Event = 0,
  Hello = 1,
  Initialize = 2,
  Heartbeat = 3
}

export interface WebSocketData {
  [userId: string]: LanyardData;
}
