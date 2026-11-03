import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Check, 
  Volume2, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  MediaMetadata, 
  OutputFormat, 
  VideoResolution, 
  AudioBitrate, 
  TrimRange,
  DownloadHistoryItem 
} from '../types';
import { formatTime, formatDurationSimple, SAMPLE_URLS } from '../utils/mediaParser';
import { createRealMediaBlob, saveMediaFileToFolder } from '../utils/mediaGenerator';

interface TrimmerStudioProps {
  currentFolder: string;
  initialMedia?: MediaMetadata | null;
  initialTrim?: TrimRange | null;
  onAddHistoryItem: (item: DownloadHistoryItem) => void;
  onOpenMediaPlayer: (item: DownloadHistoryItem) => void;
  onOpenExplorer: () => void;
}

export const TrimmerStudio: React.FC<TrimmerStudioProps> = ({
  currentFolder,
  initialMedia,
  initialTrim,
  onAddHistoryItem,
  onOpenMediaPlayer,
  onOpenExplorer,
}) => {
  const [media, setMedia] = useState<MediaMetadata>(() => {
    if (initialMedia) return initialMedia;
    const sample = SAMPLE_URLS[0];
    return {
      id: 'media_sample_0',
      url: sample.url,
      platform: sample.platform,
      title: sample.title,
      author: sample.author,
      duration: sample.duration,
      thumbnail: sample.thumbnail,
      sourceQuality: 'High Definition',
      availableResolutions: ['1080p', '720p', '480p'],
      availableBitrates: ['320k', '256k', '192k', 'lossless'],
      filesizeApprox: 45,
    };
  });

  const duration = media.duration;

  const [startTime, setStartTime] = useState<number>(initialTrim?.start ?? 15);
  const [endTime, setEndTime] = useState<number>(initialTrim?.end ?? Math.min(media.duration, 75));
  const [currentTime, setCurrentTime] = useState<number>(startTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [format, setFormat] = useState<OutputFormat>('MP3');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [bitrate, setBitrate] = useState<AudioBitrate>('320k');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastSavedItem, setLastSavedItem] = useState<DownloadHistoryItem | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const playbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialMedia) {
      setMedia(initialMedia);
      setStartTime(initialTrim?.start ?? 0);
      setEndTime(initialTrim?.end ?? Math.min(initialMedia.duration, 60));
      setCurrentTime(initialTrim?.start ?? 0);
    }
  }, [initialMedia, initialTrim]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const startPlayback = () => {
    stopPlayback();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;

      setIsPlaying(true);

      const stepMs = 50;
      let playHead = startTime;
      setCurrentTime(playHead);

      playbackTimerRef.current = window.setInterval(() => {
        playHead += stepMs / 1000;
        if (playHead >= endTime) {
          stopPlayback();
          setCurrentTime(startTime);
        } else {
          setCurrentTime(playHead);
          if (osc && ctx) {
            const semitone = Math.floor(playHead * 2) % 6;
            const freqs = [220, 261.63, 293.66, 329.63, 392.00, 440.00];
            osc.frequency.setValueAtTime(freqs[semitone] || 220, ctx.currentTime);
          }
        }
      }, stepMs);

    } catch (e) {
      console.warn('Audio preview error:', e);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const applyPreset = (type: 'first30' | 'middle' | 'noIntro' | 'noOutro') => {
    stopPlayback();
    if (type === 'first30') {
      setStartTime(0);
      setEndTime(Math.min(30, duration));
      setCurrentTime(0);
    } else if (type === 'middle') {
      const mid = duration / 2;
      setStartTime(Math.max(0, Math.floor(mid - 20)));
      setEndTime(Math.min(duration, Math.floor(mid + 20)));
      setCurrentTime(Math.max(0, Math.floor(mid - 20)));
    } else if (type === 'noIntro') {
      setStartTime(15);
      setEndTime(duration);
      setCurrentTime(15);
    } else if (type === 'noOutro') {
      setStartTime(0);
      setEndTime(Math.max(10, duration - 20));
      setCurrentTime(0);
    }
  };

  const handleExportTrimmed = async () => {
    setIsExporting(true);
    stopPlayback();

    const trimDuration = Math.max(1, endTime - startTime);
    const ext = format.toLowerCase();
    const cleanTitle = media.title.replace(/[\\/:*?"<>|]/g, '');
    const outFileName = `${cleanTitle} [${formatDurationSimple(startTime)}-${formatDurationSimple(endTime)}].${ext}`;

    try {
      const blob = await createRealMediaBlob(
        format,
        media.title,
        media.author,
        resolution,
        trimDuration,
        bitrate
      );

      await saveMediaFileToFolder(blob, outFileName);

      const historyItem: DownloadHistoryItem = {
        id: 'trim_hist_' + Date.now(),
        title: `${media.title} (Фрагмент)`,
        author: media.author,
        originalUrl: media.url,
        platform: media.platform,
        format,
        quality: format === 'MP4' ? resolution : bitrate,
        duration: trimDuration,
        fileSizeText: `${(blob.size / (1024 * 1024)).toFixed(1)} МБ`,
        folderPath: currentFolder,
        fileName: outFileName,
        timestamp: Date.now(),
        thumbnail: media.thumbnail,
        blobUrl: URL.createObjectURL(blob),
        trimUsed: true,
        trimInfo: `${formatDurationSimple(startTime)} - ${formatDurationSimple(endTime)}`,
      };

      setLastSavedItem(historyItem);
      onAddHistoryItem(historyItem);

    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const totalBars = 75;
  const waveformBars = Array.from({ length: totalBars }, (_, i) => {
    const norm = i / totalBars;
    const wave = Math.abs(Math.sin(norm * 12) * 0.75 + Math.cos(norm * 24) * 0.25);
    return Math.max(12, Math.min(100, wave * 100));
  });

  const selectedDuration = Math.max(0, endTime - startTime);
  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;
  const playheadPercent = (currentTime / duration) * 100;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Strict Header */}
        <div className="flex items-baseline justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              Обрезка медиапотока
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Прецизионное выделение интервала с миллисекундным шагом.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-mono text-[11px]">Файл:</span>
            <select
              value={media.url}
              onChange={(e) => {
                const found = SAMPLE_URLS.find(s => s.url === e.target.value);
                if (found) {
                  stopPlayback();
                  setMedia({
                    id: 'm_' + Math.random(),
                    url: found.url,
                    platform: found.platform,
                    title: found.title,
                    author: found.author,
                    duration: found.duration,
                    thumbnail: found.thumbnail,
                    sourceQuality: 'High Definition',
                    availableResolutions: ['1080p', '720p'],
                    availableBitrates: ['320k', '256k', '192k'],
                    filesizeApprox: 30,
                  });
                  setStartTime(10);
                  setEndTime(Math.min(found.duration, 70));
                  setCurrentTime(10);
                }
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded px-2 py-1 font-mono focus:outline-none"
            >
              {SAMPLE_URLS.map(s => (
                <option key={s.url} value={s.url}>
                  {s.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Media Snippet Bar */}
        <div className="p-3 rounded-md bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={media.thumbnail}
              alt={media.title}
              referrerPolicy="no-referrer"
              className="w-14 h-10 rounded object-cover border border-neutral-800 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">{media.title}</div>
              <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                {formatDurationSimple(selectedDuration)} из {formatDurationSimple(duration)} · {formatTime(startTime)} → {formatTime(endTime)}
              </div>
            </div>
          </div>

          <button
            onClick={togglePlay}
            className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Пауза' : 'Слушать'}</span>
          </button>
        </div>

        {/* Waveform Canvas */}
        <div className="p-4 rounded-md bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>00:00.0</span>
            <span className="text-white">Позиция: {formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Minimalist Waveform Display */}
          <div className="relative h-24 bg-neutral-950 rounded border border-neutral-850 flex items-end p-2 px-3 overflow-hidden">
            <div className="w-full h-full flex items-center justify-between gap-1 z-0">
              {waveformBars.map((height, i) => {
                const barPercent = (i / totalBars) * 100;
                const isInSelectedRange = barPercent >= startPercent && barPercent <= endPercent;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-xs transition-colors duration-100 ${
                      isInSelectedRange
                        ? 'bg-neutral-200'
                        : 'bg-neutral-800'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Selection overlay */}
            <div
              className="absolute top-0 bottom-0 bg-neutral-500/10 border-x border-neutral-400 pointer-events-none z-10"
              style={{
                left: `${startPercent}%`,
                width: `${Math.max(1, endPercent - startPercent)}%`,
              }}
            />

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            />
          </div>

          {/* Precision Slider Handles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Старт:</span>
                <span className="font-mono text-white font-medium">{formatTime(startTime)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, endTime - 1)}
                step={0.5}
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStartTime(val);
                  if (currentTime < val) setCurrentTime(val);
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-0.5">
                <div className="flex gap-1">
                  <button onClick={() => setStartTime(Math.max(0, startTime - 1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">-1s</button>
                  <button onClick={() => setStartTime(Math.max(0, startTime - 0.1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">-0.1s</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setStartTime(Math.min(endTime - 1, startTime + 0.1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">+0.1s</button>
                  <button onClick={() => setStartTime(Math.min(endTime - 1, startTime + 1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">+1s</button>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Финиш:</span>
                <span className="font-mono text-white font-medium">{formatTime(endTime)}</span>
              </div>
              <input
                type="range"
                min={Math.min(duration, startTime + 1)}
                max={duration}
                step={0.5}
                value={endTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEndTime(val);
                  if (currentTime > val) setCurrentTime(val);
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-0.5">
                <div className="flex gap-1">
                  <button onClick={() => setEndTime(Math.max(startTime + 1, endTime - 1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">-1s</button>
                  <button onClick={() => setEndTime(Math.max(startTime + 1, endTime - 0.1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">-0.1s</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEndTime(Math.min(duration, endTime + 0.1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">+0.1s</button>
                  <button onClick={() => setEndTime(Math.min(duration, endTime + 1))} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300">+1s</button>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Text Presets */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
            <span className="text-[11px] text-neutral-400">Шаблоны:</span>
            <button onClick={() => applyPreset('first30')} className="hover:text-white transition-colors cursor-pointer text-[11px]">30 сек</button>
            <span className="text-neutral-700">/</span>
            <button onClick={() => applyPreset('middle')} className="hover:text-white transition-colors cursor-pointer text-[11px]">Середина 40с</button>
            <span className="text-neutral-700">/</span>
            <button onClick={() => applyPreset('noIntro')} className="hover:text-white transition-colors cursor-pointer text-[11px]">Без интро</button>
            <span className="text-neutral-700">/</span>
            <button onClick={() => applyPreset('noOutro')} className="hover:text-white transition-colors cursor-pointer text-[11px]">Без аутро</button>
          </div>
        </div>

        {/* Minimal Export Bar */}
        <div className="p-3.5 rounded-md bg-neutral-900/60 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-neutral-300 font-mono">
            Длина: {formatDurationSimple(selectedDuration)}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-850">
              {(['MP3', 'WAV', 'FLAC', 'AAC', 'MP4'] as OutputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                    format === fmt ? 'bg-neutral-100 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {format === 'MP4' ? (
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as VideoResolution)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2 py-1 font-mono focus:outline-none"
              >
                <option value="2160p">4K (2160p)</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            ) : (
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value as AudioBitrate)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2 py-1 font-mono focus:outline-none"
              >
                <option value="320k">320k</option>
                <option value="256k">256k</option>
                <option value="192k">192k</option>
                <option value="lossless">Lossless</option>
              </select>
            )}

            <button
              onClick={handleExportTrimmed}
              disabled={isExporting}
              className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Экспорт...' : 'Сохранить'}</span>
            </button>
          </div>
        </div>

        {lastSavedItem && (
          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-700 text-xs flex items-center justify-between text-neutral-300">
            <span className="font-mono">Фрагмент сохранен: {lastSavedItem.fileName}</span>
            <div className="flex gap-2">
              <button onClick={() => onOpenMediaPlayer(lastSavedItem)} className="text-white hover:underline">Воспроизвести</button>
              <button onClick={onOpenExplorer} className="text-neutral-400 hover:text-white">Папка</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
