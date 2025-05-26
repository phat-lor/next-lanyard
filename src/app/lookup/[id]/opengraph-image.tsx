import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Discord Presence';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function fetchUserData(userId: string) {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
  } catch (err) {
    console.error('Error fetching user data:', err);
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const data = await fetchUserData(params.id);
  const user = data?.data?.discord_user;
  
  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'rgb(24 24 27)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold' }}>User Not Found</div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'rgb(24 24 27)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
          color: 'white',
          padding: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
          }}
        >
          {/* Avatar */}
          <img
            src={avatarUrl}
            width={200}
            height={200}
            alt={`${user.global_name || user.username}'s Discord avatar`}
            style={{
              borderRadius: 100,
            }}
          />
          
          {/* User Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 60, fontWeight: 'bold' }}>
              {user.global_name || user.username}
            </div>
            <div style={{ fontSize: 32, color: 'rgb(161 161 170)' }}>
              Discord Presence
            </div>
            {data.data.spotify && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px 20px',
                  borderRadius: 12,
                }}
              >
                <div style={{ width: 24, height: 24 }}>
                  <svg viewBox="0 0 24 24" fill="#1DB954">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <div style={{ fontSize: 24 }}>
                  {data.data.spotify.song} - {data.data.spotify.artist}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 