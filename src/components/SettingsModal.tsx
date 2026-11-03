import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Check, 
  Sliders, 
  Volume2, 
  Layers, 
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { AppSettings, VideoResolution, AudioBitrate } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (newSettings: AppSettings) => void;
  onSelectRealDirectory: () => Promise<void>;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
  onSelectRealDirectory,
  isDark,
  onToggleTheme,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col text-xs select-none">
        <div className="h-9 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between px-3 text-neutral-200">
          <div className="flex items-center gap-2 font-medium">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span>Параметры A.U.R.A. Converter Studio</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Output Folder */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Рабочий каталог Windows:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.defaultFolder}
                onChange={(e) => setFormData({ ...formData, defaultFolder: e.target.value })}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={onSelectRealDirectory}
                className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-medium text-xs cursor-pointer"
              >
                Обзор...
              </button>
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Формат именования:
            </label>
            <select
              value={formData.namingPattern}
              onChange={(e) => setFormData({ ...formData, namingPattern: e.target.value as AppSettings['namingPattern'] })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-200 font-mono text-xs focus:outline-none"
            >
              <option value="{title} [{quality}]">{'{Название}'} [{'{Качество}'}].mp3</option>
              <option value="{title} - {author}">{'{Название}'} - {'{Автор}'}.mp4</option>
              <option value="{author} - {title}">{'{Автор}'} - {'{Название}'}.wav</option>
              <option value="{title}">{'{Название}'}.mp4</option>
            </select>
          </div>

          {/* Quality Defaults */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-neutral-400 block">Видео по умолчанию:</label>
              <select
                value={formData.defaultVideoRes}
                onChange={(e) => setFormData({ ...formData, defaultVideoRes: e.target.value as VideoResolution })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-200 font-mono text-xs"
              >
                <option value="2160p">4K (2160p)</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 block">Аудио по умолчанию:</label>
              <select
                value={formData.defaultAudioBitrate}
                onChange={(e) => setFormData({ ...formData, defaultAudioBitrate: e.target.value as AudioBitrate })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-200 font-mono text-xs"
              >
                <option value="320k">320 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="lossless">Lossless</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1 border-t border-neutral-850">
            <label className="flex items-center justify-between p-2 rounded bg-neutral-900/40 border border-neutral-850 cursor-pointer">
              <span className="text-neutral-300">Нормализация громкости аудио (+3 dB)</span>
              <input
                type="checkbox"
                checked={formData.audioNormalization}
                onChange={(e) => setFormData({ ...formData, audioNormalization: e.target.checked })}
                className="rounded border-neutral-700 text-neutral-100 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-neutral-900/40 border border-neutral-850 cursor-pointer">
              <span className="text-neutral-300">Предпочитать 60 FPS для видео</span>
              <input
                type="checkbox"
                checked={formData.prefer60fps}
                onChange={(e) => setFormData({ ...formData, prefer60fps: e.target.checked })}
                className="rounded border-neutral-700 text-neutral-100 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-neutral-900/40 border border-neutral-850 cursor-pointer">
              <span className="text-neutral-300">Оповещение Windows по завершении</span>
              <input
                type="checkbox"
                checked={formData.notifyOnComplete}
                onChange={(e) => setFormData({ ...formData, notifyOnComplete: e.target.checked })}
                className="rounded border-neutral-700 text-neutral-100 focus:ring-0"
              />
            </label>
          </div>

          {/* Theme */}
          <div className="pt-2 border-t border-neutral-850 flex items-center justify-between">
            <span className="text-neutral-300">Тема интерфейса:</span>
            <button
              onClick={onToggleTheme}
              className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer"
            >
              {isDark ? 'Светлая' : 'Темная'}
            </button>
          </div>
        </div>

        <div className="h-10 bg-neutral-900/80 border-t border-neutral-800 px-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-white hover:bg-neutral-200 text-neutral-950 font-semibold cursor-pointer"
          >
            {isSaved ? 'Сохранено' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
};
