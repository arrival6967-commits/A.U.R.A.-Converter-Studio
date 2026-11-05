/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar, NavTab } from './components/Sidebar';
import { SingleConverter } from './components/SingleConverter';
import { BatchPlaylistConverter } from './components/BatchPlaylistConverter';
import { TrimmerStudio } from './components/TrimmerStudio';
import { DownloadHistory } from './components/DownloadHistory';
import { SettingsModal } from './components/SettingsModal';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import { WindowsExplorerModal } from './components/WindowsExplorerModal';
import { 
  MediaMetadata, 
  TrimRange, 
  DownloadHistoryItem, 
  AppSettings 
} from './types';
import { SAMPLE_URLS } from './utils/mediaParser';

const DEFAULT_SETTINGS: AppSettings = {
  defaultFolder: 'C:\\Users\\User\\Downloads\\AURA_Converter',
  namingPattern: '{title} [{quality}]',
  autoStartDownload: true,
  parallelDownloads: 3,
  prefer60fps: true,
  audioNormalization: true,
  defaultVideoFormat: 'MP4',
  defaultVideoRes: '1080p',
  defaultAudioFormat: 'MP3',
  defaultAudioBitrate: '320k',
  notifyOnComplete: true,
};

export default function App() {
  // Theme state (Dark mode by default, fully toggleable)
  const [isDark, setIsDark] = useState<boolean>(true);

  // Window frame simulation
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('single');

  // App settings & Folder
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('omni_converter_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [currentFolder, setCurrentFolder] = useState<string>(settings.defaultFolder);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Modals state
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePlayItem, setActivePlayItem] = useState<DownloadHistoryItem | null>(null);

  // Trimmer state transfer
  const [trimmerTargetMedia, setTrimmerTargetMedia] = useState<MediaMetadata | null>(null);
  const [trimmerTargetTrim, setTrimmerTargetTrim] = useState<TrimRange | null>(null);

  // Download History with realistic initial items
  const [historyItems, setHistoryItems] = useState<DownloadHistoryItem[]>(() => {
    return [
      {
        id: 'hist_init_1',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        author: 'Lofi Girl Media',
        originalUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
        platform: 'youtube',
        format: 'MP3',
        quality: '320 kbps Ultra',
        duration: 215,
        fileSizeText: '8.4 МБ',
        folderPath: settings.defaultFolder,
        fileName: 'Lofi Hip Hop Radio [320k].mp3',
        timestamp: Date.now() - 3600000 * 2,
        thumbnail: SAMPLE_URLS[0].thumbnail,
      },
      {
        id: 'hist_init_2',
        title: 'Incredible 4K FPV Drone Cinematic Flight Over Alpine Fjords',
        author: 'u/NordicPilot',
        originalUrl: 'https://www.reddit.com/r/nextfuckinglevel/comments/17xy89/drone',
        platform: 'reddit',
        format: 'MP4',
        quality: '1080p 60fps',
        duration: 86,
        fileSizeText: '42.1 МБ',
        folderPath: settings.defaultFolder,
        fileName: 'Alpine Fjords FPV [1080p].mp4',
        timestamp: Date.now() - 3600000 * 5,
        thumbnail: SAMPLE_URLS[1].thumbnail,
      },
      {
        id: 'hist_init_3',
        title: 'Retro Wave Midnight Run (Original 320k Mix)',
        author: '@synth_master',
        originalUrl: 'https://www.tiktok.com/@producer_mike/video/7328910482910',
        platform: 'tiktok',
        format: 'FLAC',
        quality: 'Lossless 24-bit',
        duration: 54,
        fileSizeText: '18.7 МБ',
        folderPath: settings.defaultFolder,
        fileName: 'Midnight Run [Lossless].flac',
        timestamp: Date.now() - 3600000 * 12,
        thumbnail: SAMPLE_URLS[2].thumbnail,
        trimUsed: true,
        trimInfo: '00:05 - 00:45 (Всего: 00:40)',
      }
    ];
  });

  // Sync dark class on html tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased font-sans select-none overflow-hidden';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased font-sans select-none overflow-hidden';
    }
  }, [isDark]);

  // Persist settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setCurrentFolder(newSettings.defaultFolder);
    try {
      localStorage.setItem('omni_converter_settings', JSON.stringify(newSettings));
    } catch {}
  };

  // Real Windows Directory Picker via File System Access API
  const handlePickDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const picker = (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
        const handle = await picker();
        if (handle) {
          setDirHandle(handle);
          const windowsPath = `C:\\Users\\User\\Downloads\\${handle.name}`;
          setCurrentFolder(windowsPath);
          setSettings(prev => ({ ...prev, defaultFolder: windowsPath }));
          return;
        }
      } catch (err) {
        // User cancelled or browser rejected
        console.warn('Native directory pick cancelled/failed:', err);
      }
    }
    // Fallback: open Settings modal to type path
    setIsSettingsOpen(true);
  };

  // Add history item
  const handleAddHistoryItem = (item: DownloadHistoryItem) => {
    setHistoryItems(prev => [item, ...prev]);
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems(prev => prev.filter(it => it.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistoryItems([]);
  };

  // Transfer media into Trimmer Studio
  const handleOpenTrimmerForMedia = (media: MediaMetadata, currentTrim: TrimRange) => {
    setTrimmerTargetMedia(media);
    setTrimmerTargetTrim(currentTrim);
    setActiveTab('trim');
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Windows 11 Title Bar */}
      <TitleBar
        currentFolder={currentFolder}
        onOpenFolderPicker={handlePickDirectory}
        onOpenExplorer={() => setIsExplorerOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={() => {
          if (confirm('Закрыть A.U.R.A. Converter Studio?')) {
            window.location.reload();
          }
        }}
      />

      {/* Main Desktop App Body */}
      {isMinimized ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="p-6 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-3 max-w-sm shadow-sm">
            <div className="text-xs font-bold text-neutral-900 dark:text-white tracking-widest font-mono">
              A.U.R.A. STUDIO
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Окно свернуто в фоновый режим Windows.</p>
            <button
              onClick={() => setIsMinimized(false)}
              className="px-4 py-1.5 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs cursor-pointer shadow-xs"
            >
              Развернуть окно
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'settings') {
                setIsSettingsOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            historyCount={historyItems.length}
            batchCount={0}
            currentFolder={currentFolder}
            onOpenExplorer={() => setIsExplorerOpen(true)}
          />

          {/* Active Viewport */}
          <main className="flex-1 flex flex-col min-w-0 bg-neutral-100/60 dark:bg-neutral-950/90 relative transition-colors">
            {activeTab === 'single' && (
              <SingleConverter
                currentFolder={currentFolder}
                onOpenExplorer={() => setIsExplorerOpen(true)}
                onOpenTrimmerForMedia={handleOpenTrimmerForMedia}
                onAddHistoryItem={handleAddHistoryItem}
                onOpenMediaPlayer={(item) => setActivePlayItem(item)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {activeTab === 'batch' && (
              <BatchPlaylistConverter
                currentFolder={currentFolder}
                onAddHistoryItem={handleAddHistoryItem}
                onOpenMediaPlayer={(item) => setActivePlayItem(item)}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}

            {activeTab === 'trim' && (
              <TrimmerStudio
                currentFolder={currentFolder}
                initialMedia={trimmerTargetMedia}
                initialTrim={trimmerTargetTrim}
                onAddHistoryItem={handleAddHistoryItem}
                onOpenMediaPlayer={(item) => setActivePlayItem(item)}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}

            {activeTab === 'history' && (
              <DownloadHistory
                items={historyItems}
                onPlayItem={(item) => setActivePlayItem(item)}
                onDeleteItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}
          </main>
        </div>
      )}

      {/* Windows Explorer Modal */}
      <WindowsExplorerModal
        currentFolder={currentFolder}
        items={historyItems}
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onPlayItem={(item) => setActivePlayItem(item)}
        onChangeFolderPicker={handlePickDirectory}
      />

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
        onSelectRealDirectory={handlePickDirectory}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* In-App Media Player Modal */}
      <MediaPlayerModal
        item={activePlayItem}
        onClose={() => setActivePlayItem(null)}
      />
    </div>
  );
}
