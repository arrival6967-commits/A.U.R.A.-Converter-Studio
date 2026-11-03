import { MediaMetadata, SupportedPlatform, VideoResolution, AudioBitrate } from '../types';

export function detectPlatform(url: string): SupportedPlatform {
  const lower = url.toLowerCase().trim();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('reddit.com') || lower.includes('redd.it')) return 'reddit';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('soundcloud.com')) return 'soundcloud';
  if (lower.includes('vimeo.com')) return 'vimeo';
  return 'direct';
}

export function getPlatformBadge(platform: SupportedPlatform) {
  switch (platform) {
    case 'youtube':
      return { name: 'YouTube', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: 'youtube' };
    case 'reddit':
      return { name: 'Reddit', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', icon: 'reddit' };
    case 'tiktok':
      return { name: 'TikTok', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: 'tiktok' };
    case 'instagram':
      return { name: 'Instagram', color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20', icon: 'instagram' };
    case 'twitter':
      return { name: 'X / Twitter', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: 'twitter' };
    case 'soundcloud':
      return { name: 'SoundCloud', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: 'soundcloud' };
    case 'vimeo':
      return { name: 'Vimeo', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', icon: 'vimeo' };
    default:
      return { name: 'Direct Web', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'globe' };
  }
}

// Preset samples for fast testing with 1 click
export const SAMPLE_URLS = [
  {
    label: 'YouTube: Lo-Fi Chill Beats 2026',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    platform: 'youtube' as SupportedPlatform,
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    author: 'Lofi Girl Media',
    duration: 215,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    type: 'video',
  },
  {
    label: 'Reddit: r/nextfuckinglevel Epic Drone Shot',
    url: 'https://www.reddit.com/r/nextfuckinglevel/comments/17xy89/hyperlapse_over_mountains/',
    platform: 'reddit' as SupportedPlatform,
    title: 'Incredible 4K FPV Drone Cinematic Flight Over Alpine Fjords',
    author: 'u/NordicPilot',
    duration: 86,
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    type: 'video',
  },
  {
    label: 'TikTok: Viral Synthwave Remix & Bass',
    url: 'https://www.tiktok.com/@producer_mike/video/7328910482910',
    platform: 'tiktok' as SupportedPlatform,
    title: 'Retro Wave Midnight Run (Original 320k Mix)',
    author: '@synth_master',
    duration: 54,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    type: 'audio',
  },
  {
    label: 'SoundCloud: Electronic Dance Masterclass',
    url: 'https://soundcloud.com/audiocraft/cyber-odyssey-lossless',
    platform: 'soundcloud' as SupportedPlatform,
    title: 'Cyber Odyssey (Lossless Studio Master)',
    author: 'Aura Sound Labs',
    duration: 248,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    type: 'audio',
  },
  {
    label: 'Instagram: Travel Reel Tokyo Cyberpunk Night',
    url: 'https://www.instagram.com/reel/C89xZaB123/',
    platform: 'instagram' as SupportedPlatform,
    title: 'Tokyo Shinjuku Rainy Neon Reflections (60 FPS)',
    author: '@tokyo_vibes',
    duration: 42,
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    type: 'video',
  }
];

export const SAMPLE_PLAYLISTS = [
  {
    name: 'YouTube: Top Synthwave & Electronic Playlist',
    url: 'https://www.youtube.com/playlist?list=PLrAlq_P_hYvY88XzGq23pX',
    platform: 'youtube' as SupportedPlatform,
    itemsCount: 5,
    items: [
      {
        title: 'Midnight City Lights - Synth Symphony',
        author: 'Future Wave Studio',
        duration: 198,
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.youtube.com/watch?v=pl_synth_01',
      },
      {
        title: 'Deep Bassline Sunset Drive (Extended Club Edit)',
        author: 'Kavinsky Resonance',
        duration: 245,
        thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.youtube.com/watch?v=pl_synth_02',
      },
      {
        title: 'Starlight Dreamer - Ambient Electronic Lo-Fi',
        author: 'Chilled Cow',
        duration: 180,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.youtube.com/watch?v=pl_synth_03',
      },
      {
        title: 'Cyberpunk 2077 Night Club Mix',
        author: 'Neo Tokyo Records',
        duration: 312,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.youtube.com/watch?v=pl_synth_04',
      },
      {
        title: 'End of Time (Orchestral Synth Outro)',
        author: 'Hans Cyber Zimmer',
        duration: 154,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.youtube.com/watch?v=pl_synth_05',
      }
    ]
  },
  {
    name: 'Reddit: r/cinematography Best 4K Clips 2026',
    url: 'https://www.reddit.com/r/cinematography/collection/top_films_2026',
    platform: 'reddit' as SupportedPlatform,
    itemsCount: 4,
    items: [
      {
        title: 'Anamorphic 35mm Lens Test in Norwegian Fjords',
        author: 'u/CinematographerPro',
        duration: 75,
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.reddit.com/r/cinematography/comments/fjord_test',
      },
      {
        title: 'Golden Hour Portrait Lighting & Color Grade Breakdown',
        author: 'u/DirectingGuru',
        duration: 120,
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.reddit.com/r/cinematography/comments/lighting_breakdown',
      },
      {
        title: 'Slow Motion Water Droplets 1000 FPS Phantom Flex 4K',
        author: 'u/HighSpeedLab',
        duration: 64,
        thumbnail: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.reddit.com/r/cinematography/comments/phantom_droplets',
      },
      {
        title: 'Cyber City Rain Reflection Night Run',
        author: 'u/NeonWalker',
        duration: 95,
        thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=80',
        url: 'https://www.reddit.com/r/cinematography/comments/rain_neon',
      }
    ]
  }
];

export async function parseMediaUrl(url: string): Promise<MediaMetadata> {
  const cleanUrl = url.trim();
  const platform = detectPlatform(cleanUrl);
  
  // Check if it matches our presets
  const sample = SAMPLE_URLS.find(s => s.url.toLowerCase() === cleanUrl.toLowerCase());
  if (sample) {
    return {
      id: 'media_' + Math.random().toString(36).substring(2, 9),
      url: cleanUrl,
      platform,
      title: sample.title,
      author: sample.author,
      duration: sample.duration,
      thumbnail: sample.thumbnail,
      sourceQuality: '4K (2160p 60fps) / 320k Audio',
      availableResolutions: ['2160p', '1440p', '1080p', '720p', '480p'],
      availableBitrates: ['320k', '256k', '192k', '128k', 'lossless'],
      filesizeApprox: Math.round(sample.duration * 1.8),
      views: '1.4M views',
      likes: '94K'
    };
  }

  // Generate realistic smart metadata for arbitrary links
  let title = 'Extracted Media Content';
  let author = 'Creator';
  let duration = 160;
  let thumbnail = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';

  if (platform === 'youtube') {
    title = 'YouTube Studio Stream High-Res Media Track';
    author = 'YouTube Creator Hub';
    duration = 210;
    thumbnail = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
  } else if (platform === 'reddit') {
    title = 'Reddit Video Post & Audio Stream r/media';
    author = 'u/RedditMediaPoster';
    duration = 85;
    thumbnail = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80';
  } else if (platform === 'tiktok') {
    title = 'TikTok Trending Sound & Video Edit';
    author = '@tiktok_trending';
    duration = 45;
    thumbnail = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
  } else if (platform === 'soundcloud') {
    title = 'SoundCloud Original Hi-Fi Audio Track';
    author = 'Electronic Sound Studio';
    duration = 230;
    thumbnail = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
  } else if (platform === 'instagram') {
    title = 'Instagram Reel 60 FPS HD Video Track';
    author = '@creators_reel';
    duration = 38;
    thumbnail = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80';
  } else if (platform === 'twitter') {
    title = 'X Video Clip - High Quality Stream';
    author = '@TechMediaX';
    duration = 72;
    thumbnail = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  }

  // Attempt to extract title hints from URL slug if available
  try {
    const parsed = new URL(cleanUrl);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      const cleanedPart = decodeURIComponent(lastPart).replace(/[-_]/g, ' ');
      if (cleanedPart.length > 4 && !cleanedPart.includes('watch') && !cleanedPart.includes('video')) {
        title = cleanedPart.charAt(0).toUpperCase() + cleanedPart.slice(1);
      }
    }
  } catch {
    // Keep fallback
  }

  const allResolutions: VideoResolution[] = ['2160p', '1440p', '1080p', '720p', '480p'];
  const allBitrates: AudioBitrate[] = ['320k', '256k', '192k', '128k', 'lossless'];

  return {
    id: 'media_' + Math.random().toString(36).substring(2, 9),
    url: cleanUrl,
    platform,
    title,
    author,
    duration,
    thumbnail,
    sourceQuality: 'Full HD 1080p 60fps / 320 kbps Master',
    availableResolutions: allResolutions,
    availableBitrates: allBitrates,
    filesizeApprox: Math.max(8, Math.round(duration * 1.5)),
    views: '840K views',
    likes: '42K'
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function formatDurationSimple(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
