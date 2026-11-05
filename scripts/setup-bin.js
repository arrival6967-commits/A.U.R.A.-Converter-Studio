import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binDir = path.resolve(rootDir, 'bin');
const ytDlpPath = path.resolve(binDir, 'yt-dlp');
const ffmpegTarget = path.resolve(binDir, 'ffmpeg');
const ffprobeTarget = path.resolve(binDir, 'ffprobe');

async function main() {
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  // 1. Ensure ffmpeg & ffprobe in bin/ and ALWAYS enforce 0o755 executable permissions
  if (!fs.existsSync(ffmpegTarget) || !fs.existsSync(ffprobeTarget)) {
    if (fs.existsSync('/usr/bin/ffmpeg') && fs.existsSync('/usr/bin/ffprobe')) {
      try {
        fs.copyFileSync('/usr/bin/ffmpeg', ffmpegTarget);
        fs.copyFileSync('/usr/bin/ffprobe', ffprobeTarget);
        console.log('[setup-bin] Copied system /usr/bin ffmpeg & ffprobe into bin/');
      } catch (e) {
        console.warn('[setup-bin] Error copying system ffmpeg:', e.message);
      }
    } else {
      try {
        const ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg');
        const ffprobeInstaller = await import('@ffprobe-installer/ffprobe');
        const ffmpegSrc = ffmpegInstaller.default?.path || ffmpegInstaller.path;
        const ffprobeSrc = ffprobeInstaller.default?.path || ffprobeInstaller.path;

        if (ffmpegSrc && fs.existsSync(ffmpegSrc) && !fs.existsSync(ffmpegTarget)) {
          fs.copyFileSync(ffmpegSrc, ffmpegTarget);
        }
        if (ffprobeSrc && fs.existsSync(ffprobeSrc) && !fs.existsSync(ffprobeTarget)) {
          fs.copyFileSync(ffprobeSrc, ffprobeTarget);
        }
      } catch (err) {
        console.warn('[setup-bin] Note regarding ffmpeg installer packages:', err.message);
      }
    }
  }

  // Always enforce executable permissions even if files were restored from snapshot with 0644
  try {
    if (fs.existsSync(ffmpegTarget)) fs.chmodSync(ffmpegTarget, 0o755);
    if (fs.existsSync(ffprobeTarget)) fs.chmodSync(ffprobeTarget, 0o755);
  } catch (e) {
    console.warn('[setup-bin] chmod warning for ffmpeg/ffprobe:', e.message);
  }

  // 2. Ensure yt-dlp binary and ALWAYS enforce 0o755 executable permissions
  let ytDlpValid = false;
  if (fs.existsSync(ytDlpPath)) {
    try {
      const stat = fs.statSync(ytDlpPath);
      if (stat.size > 1000000) {
        fs.chmodSync(ytDlpPath, 0o755);
        ytDlpValid = true;
      }
    } catch {}
  }

  if (!ytDlpValid) {
    console.log('[setup-bin] Downloading yt-dlp standalone binary...');
    try {
      const res = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux');
      if (!res.ok) {
        console.warn('[setup-bin] Warning: failed to fetch yt-dlp binary:', res.status);
        return;
      }
      const buf = await res.arrayBuffer();
      fs.writeFileSync(ytDlpPath, Buffer.from(buf));
      fs.chmodSync(ytDlpPath, 0o755);
      console.log('[setup-bin] yt-dlp binary installed successfully. Size:', fs.statSync(ytDlpPath).size);
    } catch (err) {
      console.warn('[setup-bin] yt-dlp download error:', err.message);
    }
  } else {
    console.log('[setup-bin] yt-dlp, ffmpeg, and ffprobe binaries are ready and executable.');
  }
}

main();
