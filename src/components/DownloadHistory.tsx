import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Play, 
  Trash2, 
  Download, 
  FolderOpen, 
  Film, 
  Music
} from 'lucide-react';
import { DownloadHistoryItem, OutputFormat } from '../types';
import { formatDurationSimple } from '../utils/mediaParser';

interface DownloadHistoryProps {
  items: DownloadHistoryItem[];
  onPlayItem: (item: DownloadHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onOpenExplorer: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  items,
  onPlayItem,
  onDeleteItem,
  onClearHistory,
  onOpenExplorer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<'ALL' | OutputFormat>('ALL');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === 'ALL' || item.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const totalFiles = items.length;
  const totalMbs = items.reduce((acc, it) => {
    const num = parseFloat(it.fileSizeText) || 15;
    return acc + num;
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              История загрузок и локальные файлы
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Журнал транскодированных файлов в хранилище Windows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenExplorer}
              className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer font-medium"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Проводник</span>
            </button>

            {items.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 text-xs font-mono cursor-pointer"
              >
                Очистить
              </button>
            )}
          </div>
        </div>

        {/* Minimal Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">Файлы</div>
            <div className="text-base font-bold font-mono text-neutral-900 dark:text-white mt-0.5">{totalFiles}</div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">Объем</div>
            <div className="text-base font-bold font-mono text-neutral-900 dark:text-white mt-0.5">{totalMbs.toFixed(1)} МБ</div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">Видео MP4</div>
            <div className="text-base font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
              {items.filter(i => i.format === 'MP4').length}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">Аудио</div>
            <div className="text-base font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
              {items.filter(i => i.format !== 'MP4').length}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-2.5 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Поиск по названию или файлу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded border border-neutral-200 dark:border-neutral-850">
            {(['ALL', 'MP4', 'MP3', 'WAV', 'FLAC', 'AAC'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  formatFilter === fmt ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {fmt === 'ALL' ? 'Все' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs">
            {items.length === 0 ? 'Записей в журнале нет' : 'По запросу ничего не найдено'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredItems.map((item) => {
              const isVideo = item.format === 'MP4';
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-7 rounded bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                      {isVideo ? <Film className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" /> : <Music className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        <span className="uppercase text-neutral-800 dark:text-neutral-300 font-semibold">{item.platform}</span>
                        <span>·</span>
                        <span>{item.author}</span>
                        {item.trimUsed && (
                          <>
                            <span>·</span>
                            <span className="text-neutral-800 dark:text-neutral-300 font-medium">Обрезан</span>
                          </>
                        )}
                      </div>

                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">
                        {item.title}
                      </div>

                      <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.format} ({item.quality})</span> · {item.fileSizeText} · {formatDurationSimple(item.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPlayItem(item)}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Слушать</span>
                    </button>

                    <button
                      onClick={onOpenExplorer}
                      title="В папку"
                      className="p-1 rounded text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>

                    {item.blobUrl && (
                      <a
                        href={item.blobUrl}
                        download={item.fileName}
                        title="Экспорт"
                        className="p-1 rounded text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      title="Удалить"
                      className="p-1 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
