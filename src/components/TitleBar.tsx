import React from 'react';
import { 
  Folder, 
  Minus, 
  Square, 
  X, 
  Sun, 
  Moon
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface TitleBarProps {
  currentFolder: string;
  onOpenFolderPicker: () => void;
  onOpenExplorer: () => void;
  onOpenInstaller: () => void;
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
  onOpenInstaller,
  isDark,
  onToggleTheme,
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
}) => {
  return (
    <header className="h-9 bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800/90 flex items-center justify-between px-3 text-xs select-none z-50 shrink-0 transition-colors">
      {/* Zone 1: A.U.R.A. Brand & Window Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <AuraLogo size="sm" />
        <div className="flex items-center gap-1.5 font-medium tracking-tight">
          <span className="font-bold text-neutral-900 dark:text-white tracking-widest text-[11px]">A.U.R.A.</span>
          <span className="text-neutral-400 dark:text-neutral-600 font-normal">|</span>
          <span className="text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold truncate">Converter Studio</span>
          <span className="text-neutral-500 dark:text-neutral-600 text-[10px] font-mono hidden sm:inline ml-1">x64</span>
        </div>
      </div>

      {/* Zone 2: Strict Path Identifier */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <button
          onClick={onOpenExplorer}
          title="Открыть проводник"
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <Folder className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
          <span className="font-mono text-[10px] max-w-[240px] truncate">{currentFolder}</span>
        </button>

        <button
          onClick={onOpenFolderPicker}
          title="Выбрать каталог"
          className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white text-[11px] transition-colors cursor-pointer font-medium"
        >
          Обзор
        </button>
      </div>

      {/* Zone 3: Windows EXE Installer & Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenInstaller}
          title="Скачать EXE установщик для Windows"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-semibold text-[11px] cursor-pointer shadow-xs transition-colors"
        >
          <span>Скачать .EXE</span>
        </button>

        <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-800 mx-0.5" />

        <button
          onClick={onToggleTheme}
          title={isDark ? "Светлая тема" : "Темная тема"}
          className="w-7 h-6 flex items-center justify-center rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
        </button>

        <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-800 mx-0.5" />

        <button
          onClick={onMinimize}
          title="Свернуть"
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>

        <button
          onClick={onToggleMaximize}
          title={isMaximized ? "Восстановить" : "Развернуть"}
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <Square className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={onClose}
          title="Закрыть"
          className="w-8 h-6 flex items-center justify-center rounded text-neutral-600 hover:text-white hover:bg-red-600 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-red-600/90 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
