import React from 'react';
import { 
  Folder, 
  Minus, 
  Square, 
  X, 
  Sun, 
  Moon,
  ChevronRight
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface TitleBarProps {
  currentFolder: string;
  onOpenFolderPicker: () => void;
  onOpenExplorer: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentFolder,
  onOpenFolderPicker,
  onOpenExplorer,
  isDark,
  onToggleTheme,
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
}) => {
  return (
    <header className="h-9 bg-neutral-950 dark:bg-neutral-950 text-neutral-300 border-b border-neutral-800/90 flex items-center justify-between px-3 text-xs select-none z-50 shrink-0">
      {/* Zone 1: A.U.R.A. Brand & Window Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <AuraLogo size="sm" />
        <div className="flex items-center gap-1.5 font-medium tracking-tight">
          <span className="font-semibold text-white tracking-widest text-[11px]">A.U.R.A.</span>
          <span className="text-neutral-500 font-normal">|</span>
          <span className="text-neutral-300 text-[11px] truncate">Converter Studio</span>
          <span className="text-neutral-600 text-[10px] font-mono hidden sm:inline ml-1">x64</span>
        </div>
      </div>

      {/* Zone 2: Strict Path Identifier */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <button
          onClick={onOpenExplorer}
          title="Открыть проводник"
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 text-neutral-300 transition-colors cursor-pointer"
        >
          <Folder className="w-3 h-3 text-neutral-400" />
          <span className="font-mono text-[10px] max-w-[240px] truncate">{currentFolder}</span>
        </button>

        <button
          onClick={onOpenFolderPicker}
          title="Выбрать каталог"
          className="text-neutral-400 hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          Обзор
        </button>
      </div>

      {/* Zone 3: Minimal Theme & Window Controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onToggleTheme}
          title={isDark ? "Светлая тема" : "Темная тема"}
          className="w-7 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        </button>

        <div className="h-3 w-px bg-neutral-800 mx-1" />

        <button
          onClick={onMinimize}
          title="Свернуть"
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>

        <button
          onClick={onToggleMaximize}
          title={isMaximized ? "Восстановить" : "Развернуть"}
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <Square className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={onClose}
          title="Закрыть"
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-red-600/90 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
