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
  if (lower.includes('vk.com') || lower.includes('vkvideo.ru')) return 'vk';
  if (lower.includes('rutube.ru')) return 'rutube';
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
    case 'vk':
      return { name: 'VK Видео', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: 'vk' };
    case 'rutube':
      return { name: 'RuTube', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: 'rutube' };
    default:
      return { name: 'Прямой поток', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'globe' };
  }
}

export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function formatSlugToTitle(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

// Preset samples for fast testing with 1 click
export const SAMPLE_URLS = [
  {
    label: 'YouTube: Rick Astley - Never Gonna Give You Up',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube' as SupportedPlatform,
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    author: 'Rick Astley',
    duration: 213,
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    type: 'video',
  },
  {
    label: 'Reddit: r/nextfuckinglevel Epic Drone',
    url: 'https://www.reddit.com/r/nextfuckinglevel/comments/17xy89/hyperlapse_over_mountains/',
    platform: 'reddit' as SupportedPlatform,
    title: 'Hyperlapse Over Mountains (Incredible 4K FPV Drone)',
    author: 'r/nextfuckinglevel',
    duration: 86,
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    type: 'video',
  },
  {
    label: 'TikTok: Viral Synthwave Remix',
    url: 'https://www.tiktok.com/@producer_mike/video/7328910482910',
    platform: 'tiktok' as SupportedPlatform,
    title: 'Retro Wave Midnight Run (Original 320k Mix)',
    author: '@producer_mike',
    duration: 54,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    type: 'audio',
  },
  {
    label: 'SoundCloud: Cyber Odyssey Master',
    url: 'https://soundcloud.com/audiocraft/cyber-odyssey-lossless',
    platform: 'soundcloud' as SupportedPlatform,
    title: 'Cyber Odyssey (Lossless Studio Master)',
    author: 'Aura Sound Labs',
    duration: 248,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    type: 'audio',
  },
  {
    label: 'VK: Видеозапись',
    url: 'https://vk.com/video-220754053_456241474',
    platform: 'vk' as SupportedPlatform,
    title: 'VK Видеозапись (HD Качество)',
    author: 'VK Video Hub',
    duration: 140,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
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
    name: 'Reddit: r/cinematography Best 4K Clips',
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

  const allResolutions: VideoResolution[] = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];
  const allBitrates: AudioBitrate[] = ['320k', '256k', '192k', '128k', 'lossless'];

  // Check preset samples first
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
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: Math.round(sample.duration * 1.8),
      views: '1.4M views',
      likes: '94K'
    };
  }

  // 1. First, attempt server-side proxy route /api/parse-media
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const serverRes = await fetch(`/api/parse-media?url=${encodeURIComponent(cleanUrl)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data && data.title) {
        return {
          id: 'media_' + Math.random().toString(36).substring(2, 9),
          url: cleanUrl,
          platform: (data.platform as SupportedPlatform) || platform,
          title: data.title,
          author: data.author || 'Creator',
          duration: data.duration || 180,
          thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          sourceQuality: '4K (2160p 60fps) / 320k Master',
          availableResolutions: allResolutions,
          availableBitrates: allBitrates,
          filesizeApprox: Math.max(12, Math.round((data.duration || 180) * 1.6)),
          views: data.views || '1.1M views',
          likes: data.likes || '52K'
        };
      }
    }
  } catch {
    // If backend proxy fails or is not available, proceed to client-side extractors
  }

  // 2. Client-side extraction for YouTube
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(cleanUrl);
    if (videoId) {
      const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      let title = `YouTube Video (${videoId})`;
      let author = 'YouTube Channel';

      // YouTube oEmbed supports direct browser CORS requests!
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData.title) title = decodeHtmlEntities(oembedData.title);
          if (oembedData.author_name) author = decodeHtmlEntities(oembedData.author_name);
        }
      } catch {
        // Fallback to noembed
        try {
          const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
          if (noembedRes.ok) {
            const data = await noembedRes.json();
            if (data.title) title = decodeHtmlEntities(data.title);
            if (data.author_name) author = decodeHtmlEntities(data.author_name);
          }
        } catch {
          // Keep videoId title
        }
      }

      return {
        id: 'yt_' + videoId,
        url: cleanUrl,
        platform: 'youtube',
        title,
        author,
        duration: 215,
        thumbnail: fallbackThumb,
        sourceQuality: '4K Ultra HD (2160p 60fps) / 320 kbps Master',
        availableResolutions: allResolutions,
        availableBitrates: allBitrates,
        filesizeApprox: 45,
        views: '1.2M views',
        likes: '74K'
      };
    }
  }

  // 3. Client-side extraction for Vimeo
  if (platform === 'vimeo') {
    try {
      const vRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        return {
          id: 'vimeo_' + (vData.video_id || Math.random().toString(36).substring(2, 7)),
          url: cleanUrl,
          platform: 'vimeo',
          title: decodeHtmlEntities(vData.title || 'Vimeo Cinematic Video'),
          author: decodeHtmlEntities(vData.author_name || 'Vimeo Creator'),
          duration: vData.duration || 150,
          thumbnail: vData.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          sourceQuality: 'Full HD 1080p / 320 kbps Master',
          availableResolutions: allResolutions,
          availableBitrates: allBitrates,
          filesizeApprox: 32,
          views: '280K views',
          likes: '12K'
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // 4. Client-side extraction for SoundCloud
  if (platform === 'soundcloud') {
    try {
      const scRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
      if (scRes.ok) {
        const scData = await scRes.json();
        return {
          id: 'sc_' + Math.random().toString(36).substring(2, 7),
          url: cleanUrl,
          platform: 'soundcloud',
          title: decodeHtmlEntities(scData.title || 'SoundCloud Hi-Fi Track'),
          author: decodeHtmlEntities(scData.author_name || 'SoundCloud Artist'),
          duration: 210,
          thumbnail: scData.thumbnail_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
          sourceQuality: 'Studio Lossless / 320 kbps Master',
          availableResolutions: allResolutions,
          availableBitrates: allBitrates,
          filesizeApprox: 18,
          views: '380K plays',
          likes: '19K'
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // 5. Client-side semantic URL extraction for Reddit
  if (platform === 'reddit') {
    let author = 'r/RedditMedia';
    let title = 'Reddit Media Post';

    const subMatch = cleanUrl.match(/reddit\.com\/r\/([^/?#]+)/i);
    if (subMatch) {
      author = `r/${subMatch[1]}`;
    }

    const slugMatch = cleanUrl.match(/\/comments\/[a-zA-Z0-9]+\/([^/?#]+)/i);
    if (slugMatch && slugMatch[1]) {
      title = formatSlugToTitle(slugMatch[1]);
    } else if (subMatch) {
      title = `Пост из сообщества r/${subMatch[1]}`;
    }

    return {
      id: 'reddit_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'reddit',
      title,
      author,
      duration: 75,
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'HD 1080p / 320 kbps Audio',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 24,
      views: '15.4K upvotes',
      likes: '920 comments'
    };
  }

  // 6. Client-side semantic URL extraction for TikTok
  if (platform === 'tiktok') {
    let author = '@tiktok_creator';
    let title = 'TikTok Видеоклип';

    const userMatch = cleanUrl.match(/@([^/?#]+)/i);
    if (userMatch) {
      author = `@${userMatch[1]}`;
    }

    const vidMatch = cleanUrl.match(/\/video\/([0-9]+)/i);
    if (vidMatch) {
      title = `TikTok Клип от ${author} (#${vidMatch[1].slice(-4)})`;
    } else {
      title = `TikTok Клип от ${author}`;
    }

    return {
      id: 'tt_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'tiktok',
      title,
      author,
      duration: 48,
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'Full HD 1080p Vertical 60fps',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 16,
      views: '450K views',
      likes: '38K'
    };
  }

  // 7. Client-side semantic URL extraction for VK
  if (platform === 'vk') {
    let title = 'VK Видеозапись';
    const vkMatch = cleanUrl.match(/(?:video|clip)(-?[0-9]+_[0-9]+)/i);
    if (vkMatch) {
      title = `VK Видеопоток (${vkMatch[1]})`;
    }

    return {
      id: 'vk_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'vk',
      title,
      author: 'VK Video',
      duration: 135,
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'Full HD 1080p / 320 kbps Master',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 28,
      views: '88K views',
      likes: '4.2K'
    };
  }

  // 8. Client-side semantic URL extraction for RuTube
  if (platform === 'rutube') {
    let title = 'RuTube Видеопоток';
    const rtMatch = cleanUrl.match(/\/video\/([a-zA-Z0-9]+)/i);
    if (rtMatch) {
      title = `RuTube Видео (${rtMatch[1].slice(0, 8)})`;
    }

    return {
      id: 'rt_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'rutube',
      title,
      author: 'RuTube Channel',
      duration: 180,
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'Full HD 1080p / 320 kbps',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 36,
      views: '120K views',
      likes: '5.1K'
    };
  }

  // 9. Client-side extraction for Instagram
  if (platform === 'instagram') {
    let title = 'Instagram Reel';
    const reelMatch = cleanUrl.match(/\/(?:reel|p)\/([^/?#]+)/i);
    if (reelMatch) {
      title = `Instagram Reel (${reelMatch[1]})`;
    }

    return {
      id: 'ig_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'instagram',
      title,
      author: '@instagram_creator',
      duration: 42,
      thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'HD 1080p Vertical 60fps',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 14,
      views: '290K views',
      likes: '24K'
    };
  }

  // 10. Client-side extraction for Twitter / X
  if (platform === 'twitter') {
    let author = '@TechMediaX';
    const userMatch = cleanUrl.match(/(?:twitter|x)\.com\/([^/?#]+)/i);
    if (userMatch && userMatch[1] !== 'status') {
      author = `@${userMatch[1]}`;
    }

    return {
      id: 'tw_' + Math.random().toString(36).substring(2, 7),
      url: cleanUrl,
      platform: 'twitter',
      title: `Видеопост от ${author} (X / Twitter)`,
      author,
      duration: 68,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      sourceQuality: 'HD 1080p Stream / 320 kbps Audio',
      availableResolutions: allResolutions,
      availableBitrates: allBitrates,
      filesizeApprox: 20,
      views: '84K views',
      likes: '6.4K'
    };
  }

  // 11. Generic Direct Media or Web Link
  let title = 'Медиа-поток высокой четкости';
  let author = 'Веб-источник';

  try {
    const parsed = new URL(cleanUrl);
    author = parsed.hostname.replace('www.', '');
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      const withoutExt = lastPart.replace(/\.[a-zA-Z0-9]+$/, '');
      const formatted = formatSlugToTitle(withoutExt);
      if (formatted.length >= 3) {
        title = formatted;
      }
    }
  } catch {
    // Keep fallback
  }

  return {
    id: 'media_' + Math.random().toString(36).substring(2, 9),
    url: cleanUrl,
    platform: 'direct',
    title,
    author,
    duration: 150,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    sourceQuality: 'Full HD 1080p 60fps / 320 kbps Master',
    availableResolutions: allResolutions,
    availableBitrates: allBitrates,
    filesizeApprox: 30,
    views: '650K views',
    likes: '31K'
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
