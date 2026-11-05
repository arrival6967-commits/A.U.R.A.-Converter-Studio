import { OutputFormat, VideoResolution, AudioBitrate } from '../types';

/**
 * Downloads and transcodes the genuine media file directly from the video hosting or social platform
 * via the server engine (yt-dlp + ffmpeg).
 * Strictly guarantees authentic audio/video matching the original URL.
 */
export async function createRealMediaBlob(
  format: OutputFormat,
  title: string,
  _author: string,
  resolution: VideoResolution = '1080p',
  _durationSeconds: number = 60,
  bitrate: AudioBitrate = '320k',
  sourceUrl?: string,
  trim?: { start: number; end: number; enabled: boolean },
  sampleRate?: string,
  channels?: 'stereo' | 'mono',
  normalizeAudio?: boolean
): Promise<Blob> {
  if (!sourceUrl || !sourceUrl.trim()) {
    throw new Error('Укажите корректную ссылку на видео или трек для скачивания.');
  }

  const response = await fetch('/api/convert-media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: sourceUrl.trim(),
      format,
      resolution,
      bitrate,
      trim,
      sampleRate,
      channels,
      normalizeAudio,
      title
    })
  });

  if (!response.ok) {
    const rawText = await response.text();
    let errorDetails = '';
    try {
      const errJson = JSON.parse(rawText);
      if (errJson && errJson.error) {
        errorDetails = errJson.error;
      }
    } catch {
      if (
        rawText.includes('403') ||
        rawText.includes('Forbidden') ||
        response.status === 403 ||
        rawText.includes('bot') ||
        rawText.includes('Sign in')
      ) {
        errorDetails = 'YouTube заблокировал анонимный серверный запрос («Sign in to confirm you’re not a bot»). Чтобы обойти блокировку YouTube, добавьте cookies в Настройках приложения.';
      } else {
        const cleanText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanText && cleanText.length > 5 && !cleanText.includes('<!DOCTYPE') && !cleanText.includes('<html')) {
          errorDetails = cleanText;
        } else if (response.status === 500) {
          errorDetails = 'Временный сбой серверного модуля конвертации. Попробуйте повторить или воспользуйтесь кнопкой «Прямая выгрузка».';
        } else {
          errorDetails = `Сбой обработки потока (код ${response.status})`;
        }
      }
    }
    throw new Error(errorDetails || `Сбой сервера при загрузке с ${sourceUrl}`);
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Сервер вернул пустой файл');
  }

  return blob;
}

/**
 * Builds direct browser download URL for native browser download streaming.
 */
export function getDirectDownloadUrl(
  sourceUrl: string,
  format: OutputFormat,
  resolution: VideoResolution = '1080p',
  bitrate: AudioBitrate = '320k',
  title: string = 'media',
  trim?: { start: number; end: number; enabled: boolean }
): string {
  const params = new URLSearchParams({
    url: sourceUrl.trim(),
    format,
    resolution,
    bitrate,
    title,
    trimStart: trim?.enabled ? String(trim.start) : '0',
    trimEnd: trim?.enabled ? String(trim.end) : '0',
    trimEnabled: trim?.enabled ? '1' : '0'
  });
  return `/api/download-media?${params.toString()}`;
}

/**
 * Native Windows File System Access API saving or fallback browser download
 */
export async function saveMediaFileToFolder(
  blob: Blob,
  fileName: string,
  directoryHandle?: FileSystemDirectoryHandle | null
): Promise<{ success: boolean; path: string }> {
  try {
    // If user provided a folder handle via window.showDirectoryPicker()
    if (directoryHandle && 'getFileHandle' in directoryHandle) {
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true, path: `${directoryHandle.name}\\${fileName}` };
    }
  } catch (err) {
    console.warn('File System Directory write failed or was cancelled, falling back to browser download:', err);
  }

  // Standard direct download fallback
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(url), 15000);
  return { success: true, path: `Downloads\\${fileName}` };
}
