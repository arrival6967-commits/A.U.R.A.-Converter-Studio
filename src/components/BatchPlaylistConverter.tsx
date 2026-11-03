import React, { useState } from 'react';
import { 
  ListMusic, 
  Sparkles, 
  Download, 
  CheckSquare, 
  Square, 
  FolderCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { 
  OutputFormat, 
  VideoResolution, 
  AudioBitrate, 
  DownloadHistoryItem 
} from '../types';
import { SAMPLE_PLAYLISTS, formatDurationSimple } from '../utils/mediaParser';
import { createRealMediaBlob, saveMediaFileToFolder } from '../utils/mediaGenerator';

interface BatchPlaylistItem {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  url: string;
  selected: boolean;
  format: OutputFormat;
  resolution: VideoResolution;
  bitrate: AudioBitrate;
  status: 'idle' | 'downloading' | 'converting' | 'completed' | 'error';
  progress: number;
  fileSizeText?: string;
  savedFileName?: string;
}

interface BatchPlaylistConverterProps {
  currentFolder: string;
  onAddHistoryItem: (item: DownloadHistoryItem) => void;
  onOpenMediaPlayer: (item: DownloadHistoryItem) => void;
  onOpenExplorer: () => void;
}

export const BatchPlaylistConverter: React.FC<BatchPlaylistConverterProps> = ({
  currentFolder,
  onAddHistoryItem,
  onOpenMediaPlayer,
  onOpenExplorer,
}) => {
  const [playlistInput, setPlaylistInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('Очередь обработки');
  const [items, setItems] = useState<BatchPlaylistItem[]>(() => {
    const sample = SAMPLE_PLAYLISTS[0];
    return sample.items.map((item, idx) => ({
      id: 'pl_item_' + idx,
      title: item.title,
      author: item.author,
      duration: item.duration,
      thumbnail: item.thumbnail,
      url: item.url,
      selected: true,
      format: 'MP3',
      resolution: '1080p',
      bitrate: '320k',
      status: 'idle',
      progress: 0,
    }));
  });

  const [globalFormat, setGlobalFormat] = useState<OutputFormat>('MP3');
  const [globalResolution, setGlobalResolution] = useState<VideoResolution>('1080p');
  const [globalBitrate, setGlobalBitrate] = useState<AudioBitrate>('320k');

  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  const handleLoadSample = (sample: typeof SAMPLE_PLAYLISTS[0]) => {
    setPlaylistInput(sample.url);
    setPlaylistTitle(sample.name.split(':')[0]);
    setItems(sample.items.map((item, idx) => ({
      id: 'pl_item_' + Date.now() + '_' + idx,
      title: item.title,
      author: item.author,
      duration: item.duration,
      thumbnail: item.thumbnail,
      url: item.url,
      selected: true,
      format: globalFormat,
      resolution: globalResolution,
      bitrate: globalBitrate,
      status: 'idle',
      progress: 0,
    })));
  };

  const handleParseCustom = () => {
    if (!playlistInput.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      const lines = playlistInput.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      
      if (lines.length > 1) {
        setPlaylistTitle(`Пакетный список (${lines.length} элементов)`);
        setItems(lines.map((url, idx) => ({
          id: 'custom_' + Date.now() + '_' + idx,
          title: `Медиа-поток #${idx + 1} (${url.split('/').pop()?.slice(0, 24) || 'stream'})`,
          author: 'A.U.R.A. Batch',
          duration: 120 + (idx * 25) % 180,
          thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
          url,
          selected: true,
          format: globalFormat,
          resolution: globalResolution,
          bitrate: globalBitrate,
          status: 'idle',
          progress: 0,
        })));
      } else {
        const found = SAMPLE_PLAYLISTS.find(p => p.url.toLowerCase() === playlistInput.toLowerCase().trim());
        if (found) {
          handleLoadSample(found);
        } else {
          setPlaylistTitle('Распознанный плейлист');
          setItems([
            {
              id: 'pl_01',
              title: 'Трек 01 (Studio Master)',
              author: 'A.U.R.A.',
              duration: 210,
              thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
              url: playlistInput,
              selected: true,
              format: globalFormat,
              resolution: globalResolution,
              bitrate: globalBitrate,
              status: 'idle',
              progress: 0,
            },
            {
              id: 'pl_02',
              title: 'Трек 02 (High Bitrate)',
              author: 'A.U.R.A.',
              duration: 185,
              thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
              url: playlistInput + '#2',
              selected: true,
              format: globalFormat,
              resolution: globalResolution,
              bitrate: globalBitrate,
              status: 'idle',
              progress: 0,
            }
          ]);
        }
      }
      setIsParsing(false);
    }, 450);
  };

  const handleToggleSelectAll = (select: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  const handleApplyGlobalFormat = (fmt: OutputFormat) => {
    setGlobalFormat(fmt);
    setItems(prev => prev.map(item => ({
      ...item,
      format: fmt,
      resolution: globalResolution,
      bitrate: globalBitrate,
    })));
  };

  const handleStartBatchQueue = async () => {
    const selectedIndices = items
      .map((item, idx) => (item.selected && item.status !== 'completed' ? idx : -1))
      .filter(idx => idx !== -1);

    if (selectedIndices.length === 0) return;

    setIsQueueRunning(true);

    for (const idx of selectedIndices) {
      setCurrentItemIndex(idx);
      const currentItem = items[idx];

      setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'downloading', progress: 15 } : it));

      for (let p = 35; p <= 85; p += 30) {
        await new Promise(r => setTimeout(r, 180));
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'converting', progress: p } : it));
      }

      try {
        const qualityTag = currentItem.format === 'MP4' ? currentItem.resolution : currentItem.bitrate;
        const cleanTitle = currentItem.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${cleanTitle} [${qualityTag}].${currentItem.format.toLowerCase()}`;

        const blob = await createRealMediaBlob(
          currentItem.format,
          currentItem.title,
          currentItem.author,
          currentItem.resolution,
          currentItem.duration,
          currentItem.bitrate
        );

        await saveMediaFileToFolder(blob, fileName);

        const fileSizeText = `${(blob.size / (1024 * 1024)).toFixed(1)} МБ`;

        const historyItem: DownloadHistoryItem = {
          id: 'batch_' + Date.now() + '_' + idx,
          title: currentItem.title,
          author: currentItem.author,
          originalUrl: currentItem.url,
          platform: 'youtube',
          format: currentItem.format,
          quality: currentItem.format === 'MP4' ? currentItem.resolution : currentItem.bitrate,
          duration: currentItem.duration,
          fileSizeText,
          folderPath: currentFolder,
          fileName,
          timestamp: Date.now(),
          thumbnail: currentItem.thumbnail,
          blobUrl: URL.createObjectURL(blob),
        };

        onAddHistoryItem(historyItem);

        setItems(prev => prev.map((it, i) => i === idx ? {
          ...it,
          status: 'completed',
          progress: 100,
          fileSizeText,
          savedFileName: fileName,
        } : it));

      } catch (err) {
        console.error(err);
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'error' } : it));
      }
    }

    setIsQueueRunning(false);
    setCurrentItemIndex(null);
  };

  const selectedCount = items.filter(i => i.selected).length;
  const completedCount = items.filter(i => i.status === 'completed').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              Пакетная очередь и плейлисты
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Массовая выгрузка плейлистов или списка ссылок с автоматическим транскодированием.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            A.U.R.A. Batch Dispatcher
          </div>
        </div>

        {/* Minimal Input Bar */}
        <div className="p-3.5 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
          <textarea
            rows={2}
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            placeholder="Вставьте ссылку на плейлист YouTube или список ссылок (каждая с новой строки)..."
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded p-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 font-mono resize-none"
          />

          <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Шаблоны:</span>
              {SAMPLE_PLAYLISTS.map((sample, idx) => (
                <React.Fragment key={sample.name}>
                  {idx > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
                  <button
                    onClick={() => handleLoadSample(sample)}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    {sample.name.split(':')[0]} ({sample.itemsCount})
                  </button>
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={handleParseCustom}
              disabled={isParsing || !playlistInput.trim()}
              className="px-3.5 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
            >
              {isParsing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              <span>Загрузить список</span>
            </button>
          </div>
        </div>

        {/* Queue Grid */}
        <div className="p-4 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">{playlistTitle}</div>
              <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">
                Выбрано: <span className="font-bold text-neutral-900 dark:text-white">{selectedCount}</span> из {items.length} · Готово: <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              </div>
            </div>

            {/* Global Format Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded border border-neutral-200 dark:border-neutral-850">
                {(['MP3', 'WAV', 'FLAC', 'AAC', 'MP4'] as OutputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleApplyGlobalFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                      globalFormat === fmt ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {globalFormat === 'MP4' ? (
                <select
                  value={globalResolution}
                  onChange={(e) => {
                    const r = e.target.value as VideoResolution;
                    setGlobalResolution(r);
                    setItems(prev => prev.map(it => ({ ...it, resolution: r })));
                  }}
                  className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded px-2 py-1 font-mono focus:outline-none"
                >
                  <option value="2160p">4K</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                </select>
              ) : (
                <select
                  value={globalBitrate}
                  onChange={(e) => {
                    const b = e.target.value as AudioBitrate;
                    setGlobalBitrate(b);
                    setItems(prev => prev.map(it => ({ ...it, bitrate: b })));
                  }}
                  className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded px-2 py-1 font-mono focus:outline-none"
                >
                  <option value="320k">320k</option>
                  <option value="256k">256k</option>
                  <option value="192k">192k</option>
                  <option value="lossless">Lossless</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-3 font-medium">
              <button onClick={() => handleToggleSelectAll(true)} className="hover:text-neutral-950 dark:hover:text-white cursor-pointer">Выбрать все</button>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <button onClick={() => handleToggleSelectAll(false)} className="hover:text-neutral-950 dark:hover:text-white cursor-pointer">Снять все</button>
            </div>
            <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {currentFolder}
            </div>
          </div>

          {/* Items Table */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded overflow-hidden max-h-[350px] overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                  item.selected ? 'bg-neutral-50/80 dark:bg-neutral-900/40' : 'bg-neutral-100/50 dark:bg-neutral-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: checked } : it));
                    }}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">{item.title}</div>
                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.author} · {formatDurationSimple(item.duration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-28">
                    {item.status === 'downloading' || item.status === 'converting' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-700 dark:text-neutral-300">
                          <span>{item.status === 'downloading' ? 'Поток...' : 'Сжатие...'}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-neutral-900 dark:bg-white h-full" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    ) : item.status === 'completed' ? (
                      <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-medium">
                        Готово ({item.fileSizeText})
                      </div>
                    ) : item.status === 'error' ? (
                      <div className="text-red-600 dark:text-red-400 text-[11px] font-mono font-medium">Сбой</div>
                    ) : (
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">Ожидание</span>
                    )}
                  </div>

                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 font-medium">
                    {item.format}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onOpenExplorer}
              className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white text-xs cursor-pointer font-mono font-medium"
            >
              Открыть каталог загрузок
            </button>

            <button
              onClick={handleStartBatchQueue}
              disabled={isQueueRunning || selectedCount === 0}
              className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isQueueRunning ? `Обработка (${currentItemIndex !== null ? currentItemIndex + 1 : 0}/${items.length})...` : `Скачать (${selectedCount})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
