import React from 'react';
import { 
  X, 
  Folder, 
  HardDrive, 
  ChevronRight, 
  Film, 
  Music, 
  ArrowUp,
  RefreshCw
} from 'lucide-react';
import { DownloadHistoryItem } from '../types';

interface WindowsExplorerModalProps {
  currentFolder: string;
  items: DownloadHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onPlayItem: (item: DownloadHistoryItem) => void;
  onChangeFolderPicker: () => void;
}

export const WindowsExplorerModal: React.FC<WindowsExplorerModalProps> = ({
  currentFolder,
  items,
  isOpen,
  onClose,
  onPlayItem,
  onChangeFolderPicker,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col text-xs select-none">
        {/* Titlebar */}
        <div className="h-8 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between px-3 text-neutral-300">
          <div className="flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-medium text-white">Проводник · {currentFolder}</span>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="p-2 bg-neutral-950 border-b border-neutral-850 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 font-mono text-[11px] overflow-hidden">
            <HardDrive className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="text-neutral-400">Диск (C:)</span>
            <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
            <span className="text-white truncate">{currentFolder}</span>
          </div>

          <button
            onClick={onChangeFolderPicker}
            className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-750 text-neutral-200 hover:bg-neutral-800 text-[11px] font-medium cursor-pointer"
          >
            Сменить...
          </button>
        </div>

        {/* Content */}
        <div className="h-72 overflow-y-auto bg-neutral-950 p-2 font-mono">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-1">
              <Folder className="w-8 h-8 text-neutral-700" />
              <div className="text-xs">Каталог пуст</div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="grid grid-cols-12 px-2.5 py-1 text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-850">
                <div className="col-span-7">Имя файла</div>
                <div className="col-span-2">Формат</div>
                <div className="col-span-3 text-right">Размер</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  onDoubleClick={() => onPlayItem(item)}
                  className="grid grid-cols-12 px-2.5 py-1.5 items-center rounded hover:bg-neutral-900 border border-transparent text-xs transition-colors group cursor-pointer"
                >
                  <div className="col-span-7 flex items-center gap-2 min-w-0 pr-2">
                    {item.format === 'MP4' ? (
                      <Film className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    )}
                    <span className="truncate text-neutral-200 group-hover:text-white font-medium">
                      {item.fileName}
                    </span>
                  </div>

                  <div className="col-span-2 text-neutral-400 text-[11px]">
                    {item.format}
                  </div>

                  <div className="col-span-3 text-right text-neutral-400 text-[11px]">
                    {item.fileSizeText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-6 bg-neutral-900/90 border-t border-neutral-800 px-3 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <div>Элементов: {items.length}</div>
          <div>NTFS · Windows 64-bit</div>
        </div>
      </div>
    </div>
  );
};
