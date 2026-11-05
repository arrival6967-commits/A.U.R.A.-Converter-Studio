import React, { useState } from 'react';
import { 
  Link2, 
  Sparkles, 
  Film, 
  Music, 
  Scissors, 
  Download, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Volume2, 
  FolderCheck, 
  Play, 
  ExternalLink,
  Loader2,
  Sliders,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { 
  MediaMetadata, 
  OutputFormat, 
  VideoResolution, 
  AudioBitrate, 
  ConversionTask, 
  TrimRange,
  DownloadHistoryItem 
} from '../types';
import { 
  SAMPLE_URLS, 
  parseMediaUrl, 
  getPlatformBadge, 
  formatDurationSimple 
} from '../utils/mediaParser';
import { createRealMediaBlob, saveMediaFileToFolder, getDirectDownloadUrl } from '../utils/mediaGenerator';

interface SingleConverterProps {
  currentFolder: string;
  onOpenExplorer: () => void;
  onOpenTrimmerForMedia: (metadata: MediaMetadata, currentTrim: TrimRange) => void;
  onAddHistoryItem: (item: DownloadHistoryItem) => void;
  onOpenMediaPlayer: (item: DownloadHistoryItem) => void;
  onOpenSettings?: () => void;
}

export const SingleConverter: React.FC<SingleConverterProps> = ({
  currentFolder,
  onOpenExplorer,
  onOpenTrimmerForMedia,
  onAddHistoryItem,
  onOpenMediaPlayer,
  onOpenSettings,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);

  // Conversion options
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('MP4');
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>('1080p');
  const [selectedBitrate, setSelectedBitrate] = useState<AudioBitrate>('320k');
  const [fps60, setFps60] = useState(true);
  const [audioChannels, setAudioChannels] = useState<'stereo' | 'mono'>('stereo');
  const [sampleRate, setSampleRate] = useState<'44100' | '48000' | '96000'>('48000');
  const [normalizeAudio, setNormalizeAudio] = useState(true);

  // Trimming option
  const [trim, setTrim] = useState<TrimRange>({ start: 0, end: 60, enabled: false });

  // Conversion Task State
  const [task, setTask] = useState<ConversionTask | null>(null);
  const [lastFinishedItem, setLastFinishedItem] = useState<DownloadHistoryItem | null>(null);

  const handleAnalyze = async (urlToTest?: string) => {
    const target = urlToTest || urlInput;
    if (!target.trim()) return;

    setIsAnalyzing(true);
    setTask(null);
    setLastFinishedItem(null);

    try {
      const data = await parseMediaUrl(target);
      setMetadata(data);
      setUrlInput(data.url);
      setTrim({
        start: 0,
        end: Math.min(data.duration, 90),
        enabled: false,
      });

      const lowerUrl = data.url.toLowerCase();
      const isAudioSource = data.platform === 'soundcloud' || 
        lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.wav') || 
        lowerUrl.endsWith('.flac') || lowerUrl.endsWith('.aac') || 
        lowerUrl.endsWith('.m4a') || lowerUrl.endsWith('.ogg');

      if (isAudioSource) {
        setMediaType('audio');
        setSelectedFormat('MP3');
      } else {
        setMediaType('video');
        setSelectedFormat('MP4');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartConversion = async () => {
    if (!metadata) return;

    const ext = selectedFormat.toLowerCase();
    const qualityTag = selectedFormat === 'MP4' ? selectedResolution : selectedBitrate;
    const cleanTitle = metadata.title.replace(/[\\/:*?"<>|]/g, '');
    const outFileName = `${cleanTitle} [${qualityTag}].${ext}`;

    const effectiveDuration = trim.enabled ? (trim.end - trim.start) : metadata.duration;

    const newTask: ConversionTask = {
      id: 'task_' + Date.now(),
      metadata,
      format: selectedFormat,
      resolution: selectedResolution,
      bitrate: selectedBitrate,
      sampleRate,
      channels: audioChannels,
      trim,
      normalizeAudio,
      status: 'downloading',
      progress: 5,
      downloadSpeed: '18.4 MB/s',
      outputFilePath: `${currentFolder}\\${outFileName}`,
      outputFileName: outFileName,
    };

    setTask(newTask);

    let curProgress = 5;
    const progressInterval = setInterval(() => {
      curProgress += Math.floor(Math.random() * 8) + 5;
      if (curProgress >= 88) {
        clearInterval(progressInterval);
      } else {
        setTask(prev => {
          if (!prev) return null;
          let statusText: ConversionTask['status'] = 'downloading';
          if (curProgress > 45) statusText = 'converting';
          return {
            ...prev,
            progress: curProgress,
            status: statusText,
            downloadSpeed: `${(15 + Math.random() * 5).toFixed(1)} MB/s`,
          };
        });
      }
    }, 180);

    try {
      const fileBlob = await createRealMediaBlob(
        selectedFormat,
        metadata.title,
        metadata.author,
        selectedResolution,
        effectiveDuration,
        selectedBitrate,
        metadata.url,
        trim,
        sampleRate,
        audioChannels,
        normalizeAudio
      );

      clearInterval(progressInterval);

      await saveMediaFileToFolder(fileBlob, outFileName);

      const blobUrl = URL.createObjectURL(fileBlob);
      const historyItem: DownloadHistoryItem = {
        id: 'hist_' + Date.now(),
        title: metadata.title,
        author: metadata.author,
        originalUrl: metadata.url,
        platform: metadata.platform,
        format: selectedFormat,
        quality: selectedFormat === 'MP4' ? `${selectedResolution} ${fps60 ? '60fps' : '30fps'}` : `${selectedBitrate}`,
        duration: effectiveDuration,
        fileSizeText: `${(fileBlob.size / (1024 * 1024)).toFixed(1)} МБ`,
        folderPath: currentFolder,
        fileName: outFileName,
        timestamp: Date.now(),
        thumbnail: metadata.thumbnail,
        blobUrl,
        trimUsed: trim.enabled,
        trimInfo: trim.enabled ? `${formatDurationSimple(trim.start)} - ${formatDurationSimple(trim.end)}` : undefined,
      };

      setTask(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        fileBlob,
        fileSizeText: historyItem.fileSizeText,
      } : null);

      setLastFinishedItem(historyItem);
      onAddHistoryItem(historyItem);

    } catch (err: any) {
      console.error(err);
      clearInterval(progressInterval);
      setTask(prev => prev ? {
        ...prev,
        status: 'error',
        error: err?.message || 'Сбой при транскодировании потока',
      } : null);
    }
  };

  const platformBadge = metadata ? getPlatformBadge(metadata.platform) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Strict Minimal Top Banner */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-baseline justify-between border-b border-neutral-200 dark:border-neutral-800/80 pb-3">
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              Переформатирование потока
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Прямая загрузка и конвертация с YouTube, Reddit, TikTok, X и аудиохостингов.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            A.U.R.A. Resampling Core
          </div>
        </div>

        {/* Minimal URL Input */}
        <div className="flex items-center gap-2 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 shadow-2xs focus-within:border-neutral-500 dark:focus-within:border-neutral-600 transition-colors">
          <div className="pl-2.5 text-neutral-400 dark:text-neutral-500">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Вставьте ссылку на медиа (YouTube, Reddit, TikTok, Instagram, X, SoundCloud)..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />
          {urlInput && (
            <button
              onClick={() => setUrlInput('')}
              className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs px-2 cursor-pointer"
            >
              Сброс
            </button>
          )}
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !urlInput.trim()}
            className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Анализ...</span>
              </>
            ) : (
              <span>Распознать</span>
            )}
          </button>
        </div>

        {/* Minimal Text Separated Presets */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 pt-0.5">
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Тестовые источники:</span>
          {SAMPLE_URLS.map((sample, idx) => (
            <React.Fragment key={sample.label}>
              {idx > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
              <button
                onClick={() => {
                  setUrlInput(sample.url);
                  handleAnalyze(sample.url);
                }}
                className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                {sample.label.split(':')[0]}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Metadata Preview & Settings Configuration */}
      {metadata && (
        <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-150">
          {/* Metadata Card */}
          <div className="p-4 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative w-full md:w-44 h-24 rounded bg-neutral-100 dark:bg-neutral-950 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800">
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                {formatDurationSimple(metadata.duration)}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-800 dark:text-neutral-300 font-semibold">
                  {metadata.platform}
                </span>
                <span>·</span>
                <span className="text-neutral-700 dark:text-neutral-400 font-medium">{metadata.author}</span>
                {metadata.views && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">{metadata.views}</span>
                  </>
                )}
              </div>

              <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-relaxed">
                {metadata.title}
              </h2>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono pt-0.5">
                <span>{metadata.sourceQuality}</span>
                <span>·</span>
                <span>~{metadata.filesizeApprox} MB</span>
              </div>
            </div>

            {/* Trimmer Trigger */}
            <div className="shrink-0">
              <button
                onClick={() => onOpenTrimmerForMedia(metadata, trim)}
                className={`px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  trim.enabled
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-400 dark:bg-neutral-800 dark:text-white'
                    : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>
                  {trim.enabled 
                    ? `Фрагмент (${formatDurationSimple(trim.start)} - ${formatDurationSimple(trim.end)})` 
                    : 'Обрезать'}
                </span>
              </button>
            </div>
          </div>

          {/* Format & Quality Configuration */}
          <div className="p-4 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            {/* Format Segment Switch */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/80 pb-3">
              <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-950 rounded border border-neutral-200 dark:border-neutral-850">
                <button
                  onClick={() => {
                    setMediaType('video');
                    setSelectedFormat('MP4');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    mediaType === 'video'
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  Видео (MP4)
                </button>
                <button
                  onClick={() => {
                    setMediaType('audio');
                    if (selectedFormat === 'MP4') setSelectedFormat('MP3');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    mediaType === 'audio'
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  Аудио (MP3, WAV, FLAC, AAC)
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                <span>Каталог:</span>
                <span className="text-neutral-800 dark:text-neutral-300 font-medium truncate max-w-[220px]">{currentFolder}</span>
              </div>
            </div>

            {/* Video Settings */}
            {mediaType === 'video' ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-300">
                  Разрешение видеопотока:
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { res: '2160p' as VideoResolution, label: '4K', desc: '3840×2160' },
                    { res: '1440p' as VideoResolution, label: '2K', desc: '2560×1440' },
                    { res: '1080p' as VideoResolution, label: '1080p', desc: 'Full HD' },
                    { res: '720p' as VideoResolution, label: '720p', desc: 'HD Ready' },
                    { res: '480p' as VideoResolution, label: '480p', desc: 'SD' },
                    { res: '360p' as VideoResolution, label: '360p', desc: 'Compact' },
                  ].map((item) => (
                    <button
                      key={item.res}
                      onClick={() => setSelectedResolution(item.res)}
                      className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                        selectedResolution === item.res
                          ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-100 font-bold shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300 dark:bg-neutral-950/60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{item.label}</div>
                      <div className={`text-[10px] ${selectedResolution === item.res ? 'text-neutral-300 dark:text-neutral-700 font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-5 pt-1 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fps60}
                      onChange={(e) => setFps60(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
                    />
                    <span>Плавность 60 FPS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={normalizeAudio}
                      onChange={(e) => setNormalizeAudio(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
                    />
                    <span>Нормализация звука</span>
                  </label>
                </div>
              </div>
            ) : (
              /* Audio Settings */
              <div className="space-y-3">
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-300">
                  Формат кодирования:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { fmt: 'MP3' as OutputFormat, label: 'MP3', desc: 'Universal MPEG' },
                    { fmt: 'WAV' as OutputFormat, label: 'WAV', desc: 'PCM Uncompressed' },
                    { fmt: 'FLAC' as OutputFormat, label: 'FLAC', desc: 'Lossless Studio' },
                    { fmt: 'AAC' as OutputFormat, label: 'AAC', desc: 'Advanced Audio' },
                  ].map((item) => (
                    <button
                      key={item.fmt}
                      onClick={() => setSelectedFormat(item.fmt)}
                      className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                        selectedFormat === item.fmt
                          ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-100 font-bold shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300 dark:bg-neutral-950/60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{item.label}</div>
                      <div className={`text-[10px] ${selectedFormat === item.fmt ? 'text-neutral-300 dark:text-neutral-700 font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-300 pt-1">
                  Битрейт звукового потока:
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { rate: '320k' as AudioBitrate, label: '320 kbps', badge: 'Ultra' },
                    { rate: '256k' as AudioBitrate, label: '256 kbps', badge: 'High' },
                    { rate: '192k' as AudioBitrate, label: '192 kbps', badge: 'Standard' },
                    { rate: '128k' as AudioBitrate, label: '128 kbps', badge: 'Eco' },
                    { rate: 'lossless' as AudioBitrate, label: 'Lossless', badge: '24-bit PCM' },
                  ].map((item) => (
                    <button
                      key={item.rate}
                      onClick={() => setSelectedBitrate(item.rate)}
                      className={`p-2 rounded border text-center transition-colors cursor-pointer ${
                        selectedBitrate === item.rate
                          ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-100 font-bold shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300 dark:bg-neutral-950/60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{item.label}</div>
                      <div className={`text-[10px] ${selectedBitrate === item.rate ? 'text-neutral-300 dark:text-neutral-700 font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {item.badge}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-neutral-700 dark:text-neutral-400 block mb-1 font-medium">Частота:</span>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value as '44100' | '48000' | '96000')}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded p-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-xs focus:outline-none"
                    >
                      <option value="44100">44.1 kHz (CD)</option>
                      <option value="48000">48.0 kHz (Studio)</option>
                      <option value="96000">96.0 kHz (Hi-Res)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-neutral-700 dark:text-neutral-400 block mb-1 font-medium">Каналы:</span>
                    <select
                      value={audioChannels}
                      onChange={(e) => setAudioChannels(e.target.value as 'stereo' | 'mono')}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded p-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-xs focus:outline-none"
                    >
                      <option value="stereo">Стерео 2.0</option>
                      <option value="mono">Моно 1.0</option>
                    </select>
                  </div>

                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-800 dark:text-neutral-300 font-medium">
                      <input
                        type="checkbox"
                        checked={normalizeAudio}
                        onChange={(e) => setNormalizeAudio(e.target.checked)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
                      />
                      <span>Нормализация +3 dB</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Execute Bar */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-neutral-700 dark:text-neutral-400 font-mono font-medium">
                {selectedFormat} · {mediaType === 'video' ? selectedResolution : selectedBitrate}
                {trim.enabled && (
                  <span className="text-neutral-900 dark:text-neutral-300 ml-1 font-semibold">
                    ({formatDurationSimple(trim.end - trim.start)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getDirectDownloadUrl(metadata.url, selectedFormat, selectedResolution, selectedBitrate, metadata.title, trim)}
                  download
                  className="px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Прямое скачивание оригинального файла браузером"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Прямая выгрузка</span>
                </a>

                <button
                  onClick={handleStartConversion}
                  disabled={task?.status === 'downloading' || task?.status === 'converting'}
                  className="px-5 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Конвертировать и сохранить</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Conversion Progress Card */}
          {task && (
            <div className="p-4 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : task.status === 'error' ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold">Ошибка</span>
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 animate-spin" />
                  )}
                  <span className="text-neutral-900 dark:text-neutral-200 font-medium truncate max-w-md">
                    {task.status === 'downloading' && 'Загрузка потока с медиасервера...'}
                    {task.status === 'converting' && `Ресемплирование в ${task.format} (${task.resolution || task.bitrate})...`}
                    {task.status === 'completed' && 'Транскодирование завершено. Файл сохранен.'}
                    {task.status === 'error' && 'Ошибка при обработке'}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  {task.status !== 'completed' && task.status !== 'error' && <span>{task.downloadSpeed}</span>}
                  <span className="font-bold text-neutral-900 dark:text-white">{task.progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    task.status === 'completed'
                      ? 'bg-emerald-600 dark:bg-emerald-500'
                      : task.status === 'error'
                      ? 'bg-red-600 dark:bg-red-500'
                      : 'bg-neutral-900 dark:bg-white'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              {/* Error feedback card */}
              {task.status === 'error' && (() => {
                const isAuthOrBot = Boolean(
                  task.error?.includes('bot') ||
                  task.error?.includes('cookies') ||
                  task.error?.includes('Sign in') ||
                  task.error?.includes('403') ||
                  task.error?.includes('Forbidden') ||
                  task.error?.includes('блокировк') ||
                  task.error?.includes('авториз') ||
                  task.error?.includes('подтвержден')
                );
                const cleanError = task.error?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Сбой при транскодировании потока';

                return (
                  <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-3 mt-2">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-950 dark:text-amber-100 text-xs">
                          {isAuthOrBot
                            ? 'YouTube требует подтверждения (Защита от ботов / Sign in required)'
                            : 'Сбой скачивания потока'}
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-300">
                          {isAuthOrBot
                            ? 'YouTube заблокировал анонимный серверный запрос («Sign in to confirm you’re not a bot»). Чтобы скачать это видео, добавьте cookies в Настройках или используйте кнопку «Прямая выгрузка».'
                            : cleanError}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      {onOpenSettings && isAuthOrBot && (
                        <button
                          type="button"
                          onClick={onOpenSettings}
                          className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Настройки Cookies</span>
                        </button>
                      )}

                      <a
                        href={getDirectDownloadUrl(metadata.url, selectedFormat, selectedResolution, selectedBitrate, metadata.title, trim)}
                        download
                        className="px-3 py-1.5 rounded border border-amber-600/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Скачивание напрямую через ваш браузер"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Прямая выгрузка</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                          setUrlInput(testUrl);
                          handleAnalyze(testUrl);
                        }}
                        className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Тестовое видео (Rick Astley)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Completed Action Strip */}
              {task.status === 'completed' && lastFinishedItem && (
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-neutral-200 dark:border-neutral-800">
                  <div className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-neutral-900 dark:text-neutral-300 font-medium">{task.outputFilePath}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMediaPlayer(lastFinishedItem)}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-semibold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Воспроизвести</span>
                    </button>

                    <a
                      href={getDirectDownloadUrl(metadata.url, selectedFormat, selectedResolution, selectedBitrate, metadata.title, trim)}
                      download
                      className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
                      title="Прямое сохранение файла"
                    >
                      <Download className="w-3 h-3" />
                      <span>Скачать файл</span>
                    </a>

                    <button
                      onClick={onOpenExplorer}
                      className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>В папке</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
