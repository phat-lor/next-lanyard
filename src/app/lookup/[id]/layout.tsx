import { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await fetchUserData(params.id);
  const user = data?.data?.discord_user;

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'This Discord user could not be found or is not being monitored by Lanyard.',
    };
  }

  const displayName = user.global_name || user.username;
  const status = data.data.discord_status;
  const activity = data.data.activities[0];
  const spotify = data.data.spotify;

  let description = `View ${displayName}'s Discord presence`;
  if (status) description += ` • Currently ${status}`;
  if (activity) description += ` • ${activity.name}`;
  if (spotify) description += ` • Listening to ${spotify.song} by ${spotify.artist}`;

  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;

  return {
    title: displayName,
    description,
    openGraph: {
      title: displayName,
      description,
      images: [
        {
          url: avatarUrl,
          width: 256,
          height: 256,
          alt: `${displayName}'s Discord avatar`
        },
        {
          url: `/lookup/${params.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${displayName}'s Discord presence`
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayName,
      description,
      images: [avatarUrl, `/lookup/${params.id}/opengraph-image`],
    },
  };
}

export default function LookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 