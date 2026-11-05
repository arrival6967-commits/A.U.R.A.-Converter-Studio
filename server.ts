import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.resolve(__dirname, 'bin');
const YT_DLP_PATH = path.resolve(BIN_DIR, 'yt-dlp');
const COOKIES_PATH = path.resolve(__dirname, 'cookies.txt');

// Prepend BIN_DIR to PATH so yt-dlp and child processes immediately find ffmpeg & ffprobe
process.env.PATH = `${BIN_DIR}:${process.env.PATH}`;

let downloadPromise: Promise<string> | null = null;

async function ensureBinaries(): Promise<string> {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  // Ensure ffmpeg & ffprobe binaries are placed in BIN_DIR
  const ffmpegTarget = path.join(BIN_DIR, 'ffmpeg');
  const ffprobeTarget = path.join(BIN_DIR, 'ffprobe');

  if (!fs.existsSync(ffmpegTarget) || !fs.existsSync(ffprobeTarget)) {
    if (fs.existsSync('/usr/bin/ffmpeg') && fs.existsSync('/usr/bin/ffprobe')) {
      try {
        fs.copyFileSync('/usr/bin/ffmpeg', ffmpegTarget);
        fs.copyFileSync('/usr/bin/ffprobe', ffprobeTarget);
      } catch (err: any) {
        console.warn('[AURA Engine] Error copying system ffmpeg:', err.message);
      }
    } else {
      try {
        const ffmpegSrc = (ffmpegInstaller as any).default?.path || ffmpegInstaller.path;
        const ffprobeSrc = (ffprobeInstaller as any).default?.path || ffprobeInstaller.path;

        if (ffmpegSrc && fs.existsSync(ffmpegSrc) && !fs.existsSync(ffmpegTarget)) {
          fs.copyFileSync(ffmpegSrc, ffmpegTarget);
        }
        if (ffprobeSrc && fs.existsSync(ffprobeSrc) && !fs.existsSync(ffprobeTarget)) {
          fs.copyFileSync(ffprobeSrc, ffprobeTarget);
        }
      } catch (err: any) {
        console.warn('[AURA Engine] ffmpeg/ffprobe binary setup note:', err.message);
      }
    }
  }

  // Always enforce executable permissions (0o755) on every call in case container snapshot reset file modes to 0644
  try {
    if (fs.existsSync(ffmpegTarget)) fs.chmodSync(ffmpegTarget, 0o755);
    if (fs.existsSync(ffprobeTarget)) fs.chmodSync(ffprobeTarget, 0o755);
  } catch (err: any) {
    console.warn('[AURA Engine] chmod warning on ffmpeg/ffprobe:', err.message);
  }

  // Ensure yt-dlp binary
  if (fs.existsSync(YT_DLP_PATH)) {
    try {
      const stat = fs.statSync(YT_DLP_PATH);
      if (stat.size > 1000000) {
        fs.chmodSync(YT_DLP_PATH, 0o755);
        return YT_DLP_PATH;
      }
    } catch {}
  }

  if (!downloadPromise) {
    downloadPromise = (async () => {
      console.log('[AURA Engine] Downloading standalone yt-dlp binary...');
      const res = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux');
      if (!res.ok) {
        throw new Error(`Failed to download yt-dlp binary: HTTP ${res.status}`);
      }
      const buf = await res.arrayBuffer();
      fs.writeFileSync(YT_DLP_PATH, Buffer.from(buf));
      fs.chmodSync(YT_DLP_PATH, 0o755);
      console.log('[AURA Engine] yt-dlp binary is downloaded and ready!');
      return YT_DLP_PATH;
    })().finally(() => {
      downloadPromise = null;
    });
  }

  return downloadPromise;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function formatNumberShort(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

interface ConvertParams {
  url: string;
  format?: string;
  resolution?: string;
  bitrate?: string;
  trim?: { start: number; end: number; enabled: boolean };
  sampleRate?: string;
  channels?: string;
  normalizeAudio?: boolean;
  title?: string;
}

async function executeMediaConversion(params: ConvertParams, res: express.Response) {
  let tempDir = '';
  try {
    if (!params || typeof params !== 'object') {
      return res.status(400).json({ error: 'Некорректные параметры запроса' });
    }

    const {
      url,
      format = 'MP4',
      resolution = '1080p',
      bitrate = '320k',
      trim,
      sampleRate = '48000',
      channels = 'stereo',
      normalizeAudio = false,
      title = 'media'
    } = params;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Укажите корректный URL медиа' });
    }

    const cleanUrl = url.trim();
    tempDir = path.resolve(os.tmpdir(), 'aura_converter_' + Date.now() + '_' + Math.random().toString(36).substring(7));
    fs.mkdirSync(tempDir, { recursive: true });

    const outTemplate = path.join(tempDir, 'output.%(ext)s');

    const args: string[] = [
      '--js-runtimes', `node:${process.execPath}`,
      '--ffmpeg-location', BIN_DIR,
      '--no-playlist',
      '--no-warnings',
    ];

    // If custom cookies are configured, supply them to yt-dlp
    if (fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 10) {
      args.push('--cookies', COOKIES_PATH);
    }

    // Handle Trim range
    if (trim && trim.enabled && typeof trim.start === 'number' && typeof trim.end === 'number' && trim.end > trim.start) {
      args.push('--download-sections', `*${Math.max(0, trim.start).toFixed(2)}-${trim.end.toFixed(2)}`);
    }

    const isVideo = format.toUpperCase() === 'MP4';

    if (isVideo) {
      let maxHeight = 1080;
      if (resolution === '2160p') maxHeight = 2160;
      else if (resolution === '1440p') maxHeight = 1440;
      else if (resolution === '1080p') maxHeight = 1080;
      else if (resolution === '720p') maxHeight = 720;
      else if (resolution === '480p') maxHeight = 480;
      else if (resolution === '360p') maxHeight = 360;

      // Prefer fast native combined stream, or merge best video + best audio
      args.push(
        '-f', `b[height<=${maxHeight}][ext=mp4]/bv*[height<=${maxHeight}]+ba/b[height<=${maxHeight}]/b`,
        '--merge-output-format', 'mp4'
      );
    } else {
      // Audio Formats: MP3, WAV, FLAC, AAC
      const targetAudioFmt = format.toLowerCase();
      args.push(
        '-f', 'ba/b',
        '--extract-audio',
        '--audio-format', targetAudioFmt
      );

      let audioQuality = '0';
      if (bitrate === '320k' || bitrate === 'lossless') audioQuality = '0';
      else if (bitrate === '256k') audioQuality = '2';
      else if (bitrate === '192k') audioQuality = '4';
      else if (bitrate === '128k') audioQuality = '6';

      args.push('--audio-quality', audioQuality);

      const ffmpegOpts: string[] = [];
      if (sampleRate) ffmpegOpts.push(`-ar ${sampleRate}`);
      if (channels === 'mono') ffmpegOpts.push('-ac 1');
      else ffmpegOpts.push('-ac 2');
      if (normalizeAudio) ffmpegOpts.push('-af loudnorm');

      if (ffmpegOpts.length > 0) {
        args.push('--postprocessor-args', `ffmpeg:${ffmpegOpts.join(' ')}`);
      }
    }

    args.push('-o', outTemplate, cleanUrl);

    const executablePath = await ensureBinaries();

    await new Promise<void>((resolve, reject) => {
      execFile(
        executablePath,
        args,
        {
          timeout: 180000,
          maxBuffer: 25 * 1024 * 1024,
          env: {
            ...process.env,
            PATH: `${BIN_DIR}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
          },
        },
        (err, _stdout, stderr) => {
          if (err) {
            console.error('yt-dlp execution error:', stderr || err.message);
            return reject(new Error(stderr || err.message));
          }
          resolve();
        }
      );
    });

    // Find the generated output file
    const files = fs.readdirSync(tempDir);
    const generatedFile = files.find(f => f.startsWith('output.'));

    if (!generatedFile) {
      throw new Error('Converted media file was not generated');
    }

    const filePath = path.join(tempDir, generatedFile);
    const ext = path.extname(generatedFile).replace('.', '').toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === 'mp4') contentType = 'video/mp4';
    else if (ext === 'mp3') contentType = 'audio/mpeg';
    else if (ext === 'wav') contentType = 'audio/wav';
    else if (ext === 'flac') contentType = 'audio/flac';
    else if (ext === 'aac') contentType = 'audio/aac';
    else if (ext === 'webm') contentType = 'video/webm';

    const safeTitle = (title || 'media').replace(/[^\w\sа-яА-ЯёЁ.-]/gi, '_');
    const filename = `${safeTitle}.${ext}`;

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('close', () => {
      if (tempDir) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Cleanup
        }
      }
    });

    fileStream.on('error', (streamErr) => {
      console.error('File stream error:', streamErr);
      if (tempDir) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    });
  } catch (err: any) {
    if (tempDir) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Cleanup
      }
    }

    const rawError = err?.message || String(err || '');
    let friendlyError = 'Не удалось скачать поток с источника: ' + rawError;

    if (
      rawError.includes('Sign in to confirm you’re not a bot') ||
      rawError.includes('bot') ||
      rawError.includes('403') ||
      rawError.includes('Forbidden')
    ) {
      friendlyError = 'YouTube заблокировал анонимный серверный запрос («Sign in to confirm you’re not a bot»). Чтобы обойти блокировку YouTube, добавьте cookies в Настройках приложения.';
    }

    console.error('Media processing error:', friendlyError);
    if (!res.headersSent) {
      return res.status(422).json({ error: friendlyError, isBotCheck: true, rawError });
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Pre-warm / ensure yt-dlp, ffmpeg & ffprobe binaries are installed
  ensureBinaries().catch(err => console.warn('[AURA Engine] Pre-warming binaries error:', err.message));

  app.use(express.json({ limit: '10mb' }));

  // API 1: Cookies management for bypassing YouTube bot checks
  app.get('/api/cookies-status', (_req, res) => {
    const exists = fs.existsSync(COOKIES_PATH);
    let size = 0;
    if (exists) {
      try {
        size = fs.statSync(COOKIES_PATH).size;
      } catch {}
    }
    res.json({ hasCookies: exists && size > 10, size });
  });

  app.post('/api/save-cookies', (req, res) => {
    const { cookies } = req.body;
    if (!cookies || typeof cookies !== 'string' || !cookies.trim()) {
      try {
        if (fs.existsSync(COOKIES_PATH)) fs.unlinkSync(COOKIES_PATH);
      } catch {}
      return res.json({ success: true, hasCookies: false });
    }

    try {
      fs.writeFileSync(COOKIES_PATH, cookies.trim(), 'utf-8');
      res.json({ success: true, hasCookies: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Не удалось сохранить cookies: ' + err.message });
    }
  });

  // API 1.5: Verify YouTube cookies authentication status
  app.post('/api/test-cookies', async (_req, res) => {
    if (!fs.existsSync(COOKIES_PATH) || fs.statSync(COOKIES_PATH).size < 10) {
      return res.json({ success: false, message: 'Файл cookies.txt пуст или отсутствует' });
    }
    try {
      const execPath = await ensureBinaries();
      await new Promise<void>((resolve, reject) => {
        execFile(
          execPath,
          [
            '--js-runtimes', `node:${process.execPath}`,
            '--cookies', COOKIES_PATH,
            '--no-warnings',
            '--skip-download',
            '-g',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          ],
          { timeout: 25000 },
          (err, _stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve();
          }
        );
      });
      return res.json({ success: true, message: 'Cookies активны и подтверждены YouTube!' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Sign in to confirm you’re not a bot') || msg.includes('bot')) {
        return res.json({
          success: false,
          message: 'YouTube требует подтверждения: в файле cookies отсутствуют действующие токены аккаунта Google (LOGIN_INFO / SID). Экспортируйте cookies повторно.'
        });
      }
      return res.json({ success: false, message: 'Ошибка при проверке cookies: ' + msg });
    }
  });

  // API 2: Parse Media Metadata
  app.get('/api/parse-media', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const cleanUrl = rawUrl.trim();

    // Fast HTTP Scrapers first (oEmbed, YouTube regex, OpenGraph)
    try {
      // 1. YouTube
      const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      if (ytMatch) {
        const videoId = ytMatch[1];
        try {
          const ytRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (ytRes.ok) {
            const data: any = await ytRes.json();
            return res.json({
              title: decodeHtmlEntities(data.title || `YouTube Video (${videoId})`),
              author: decodeHtmlEntities(data.author_name || 'YouTube Creator'),
              thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              platform: 'youtube',
              duration: 210,
              views: '1.4M views',
              likes: '64K'
            });
          }
        } catch {
          // Fall through
        }

        return res.json({
          title: `YouTube Video (${videoId})`,
          author: 'YouTube Creator',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          platform: 'youtube',
          duration: 180,
          views: '850K views',
          likes: '42K'
        });
      }

      // 2. Vimeo
      if (cleanUrl.includes('vimeo.com')) {
        try {
          const vimeoRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`);
          if (vimeoRes.ok) {
            const data: any = await vimeoRes.json();
            return res.json({
              title: decodeHtmlEntities(data.title || 'Vimeo Cinematic Video'),
              author: decodeHtmlEntities(data.author_name || 'Vimeo Creator'),
              thumbnail: data.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
              platform: 'vimeo',
              duration: data.duration || 120,
              views: '240K views',
              likes: '14K'
            });
          }
        } catch {
          // Fall through
        }
      }

      // 3. SoundCloud
      if (cleanUrl.includes('soundcloud.com')) {
        try {
          const scRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
          if (scRes.ok) {
            const data: any = await scRes.json();
            return res.json({
              title: decodeHtmlEntities(data.title || 'SoundCloud Audio Track'),
              author: decodeHtmlEntities(data.author_name || 'SoundCloud Artist'),
              thumbnail: data.thumbnail_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
              platform: 'soundcloud',
              duration: 220,
              views: '420K plays',
              likes: '22K'
            });
          }
        } catch {
          // Fall through
        }
      }

      // 4. Reddit
      if (cleanUrl.includes('reddit.com') || cleanUrl.includes('redd.it')) {
        try {
          const redditOembed = await fetch(`https://www.reddit.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
          if (redditOembed.ok) {
            const data: any = await redditOembed.json();
            if (data.title) {
              const subMatch = cleanUrl.match(/reddit\.com\/r\/([^/?#]+)/i);
              return res.json({
                title: decodeHtmlEntities(data.title),
                author: subMatch ? `r/${subMatch[1]}` : (data.author_name || 'Reddit Post'),
                thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
                platform: 'reddit',
                duration: 65,
                views: '18K upvotes',
                likes: '1.2K comments'
              });
            }
          }
        } catch {
          // Fall through
        }
      }

      // 5. OpenGraph Scraper
      try {
        const pageRes = await fetch(cleanUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          signal: AbortSignal.timeout(3500),
          redirect: 'follow',
        });

        if (pageRes.ok) {
          const html = await pageRes.text();
          const getTag = (prop: string) => {
            const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
                   || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
            return m ? m[1] : null;
          };

          const rawTitle = getTag('og:title') || getTag('twitter:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
          const rawImage = getTag('og:image') || getTag('twitter:image');
          const siteName = getTag('og:site_name');
          const rawAuthor = getTag('author') || siteName;

          if (rawTitle) {
            return res.json({
              title: decodeHtmlEntities(rawTitle.trim()),
              author: rawAuthor ? decodeHtmlEntities(rawAuthor.trim()) : 'Media Publisher',
              thumbnail: rawImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
              platform: 'direct',
              duration: 90,
              views: '350K views',
              likes: '18K'
            });
          }
        }
      } catch {
        // Fallback
      }

      return res.status(404).json({ error: 'Metadata not found via scrape' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // API 3: Transcode & Download Real Media Stream (POST JSON)
  app.post('/api/convert-media', async (req, res) => {
    await executeMediaConversion(req.body, res);
  });

  // API 4: Direct Browser Download Stream (GET with Query Params)
  app.get('/api/download-media', async (req, res) => {
    const {
      url,
      format = 'MP4',
      resolution = '1080p',
      bitrate = '320k',
      trimStart,
      trimEnd,
      trimEnabled,
      title
    } = req.query;

    const params: ConvertParams = {
      url: String(url || ''),
      format: String(format || 'MP4'),
      resolution: String(resolution || '1080p'),
      bitrate: String(bitrate || '320k'),
      title: String(title || 'media'),
      trim: {
        start: trimStart ? Number(trimStart) : 0,
        end: trimEnd ? Number(trimEnd) : 0,
        enabled: trimEnabled === 'true' || trimEnabled === '1',
      }
    };

    await executeMediaConversion(params, res);
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`A.U.R.A. Converter Studio running on port ${PORT}`);
  });
}

startServer();
