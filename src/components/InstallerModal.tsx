import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  ShieldCheck,
  FileCode,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';
import { 
  downloadWindowsSetupExe, 
  downloadWindowsBatchInstaller,
  downloadDesktopShortcut 
} from '../utils/exeGenerator';

interface InstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallerModal: React.FC<InstallerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [installProgress, setInstallProgress] = useState(0);
  const [currentFileExtracting, setCurrentFileExtracting] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleStartInstallation = () => {
    setStep(3);
    setIsInstalling(true);
    setInstallProgress(0);

    const files = [
      'aura_studio.exe (64-bit Windows PE Core)',
      'user32.dll & shell32.dll Interface Bindings',
      'desktop_shortcut_creator.ps1',
      'The Godot Entertaiment Inc. Credentials',
      'avcodec-60.dll & ffmpeg_resampler.dll',
      'google_sans_cyrillic.woff2',
      'Windows Shell Context Integration',
      'Finalizing executable registration...'
    ];

    const interval = setInterval(() => {
      setInstallProgress(prev => {
        const next = prev + Math.floor(Math.random() * 9) + 6;
        if (next >= 100) {
          clearInterval(interval);
          setIsInstalling(false);
          setStep(4);
          // Download the real PE executable with real MessageBox and Desktop Shortcut creator
          downloadWindowsSetupExe();
          return 100;
        }

        const fileIndex = Math.min(files.length - 1, Math.floor((next / 100) * files.length));
        setCurrentFileExtracting(files[fileIndex]);
        return next;
      });
    }, 110);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col text-xs select-none">
        {/* Titlebar */}
        <div className="h-8 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-3 text-neutral-800 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <AuraLogo size="sm" />
            <span className="font-semibold text-neutral-900 dark:text-white">Мастер установки A.U.R.A. Converter Studio (x64)</span>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wizard Viewport */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <AuraLogo size="lg" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Установщик A.U.R.A. Converter Studio v1.1
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Программа автоматически создаст рабочий ярлык на Рабочем столе Windows, зарегистрирует интеграцию и откроет полноэкранный рабочий интерфейс конвертера.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 space-y-2 text-neutral-800 dark:text-neutral-300 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Исполняемый файл:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">AURA_Converter_Studio_v1.1_Setup.exe</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Разработчик:</span>
                  <span className="text-neutral-900 dark:text-white font-medium">The Godot Entertaiment Inc.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Версия:</span>
                  <span className="text-neutral-900 dark:text-white font-medium">1.1 (Windows 11 / 10 x64)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Действие при запуске:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Окно подтверждения + Создание ярлыка на Рабочем столе</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Исполняемый файл скомпилирован в формате PE32+ (x86-64 GUI) для прямого запуска на Windows.</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
                  Формат и параметры установки
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Выберите способ установки приложения на компьютер:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded border border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900/40 space-y-1">
                  <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-white">
                    <span>1. Нативный установщик Windows (.EXE)</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Рекомендуется</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                    Бинарный исполняемый файл x64. При запуске выводит нативное окно Windows и создает ярлык на Рабочем столе.
                  </p>
                </div>

                <div className="p-3 rounded border border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-neutral-800 dark:text-neutral-200">
                    <span>2. Скрипт быстрой установки (.BAT)</span>
                    <span className="text-[10px] font-mono text-neutral-500">Без предупреждений SmartScreen</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                    100% совместимый командный файл Windows, запускающийся в один клик без системных предупреждений.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-3">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white font-mono uppercase tracking-wider">
                  Формирование исполняемого файла...
                </h2>
                <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">
                  Сборка: {currentFileExtracting}
                </div>
              </div>

              <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800">
                <div
                  className="bg-neutral-900 dark:bg-white h-full transition-all duration-100"
                  style={{ width: `${installProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                <span>{installProgress}% собрано</span>
                <span>The Godot Entertaiment Inc. 1.1</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Файл AURA_Converter_Studio_v1.1_Setup.exe готов!
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Загрузка файла началась автоматически. Запустите скачанный файл на вашем компьютере: на экране появится диалоговое окно подтверждения установки, и на вашем Рабочем столе появится ярлык программы.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={downloadWindowsSetupExe}
                  className="p-2.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать .EXE файл</span>
                </button>

                <button
                  onClick={downloadWindowsBatchInstaller}
                  className="p-2.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Скачать .BAT установщик</span>
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Ярлык на Рабочий стол:</span>
                <button
                  onClick={downloadDesktopShortcut}
                  className="text-neutral-900 dark:text-white hover:underline cursor-pointer font-bold"
                >
                  Скачать ярлык .URL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="h-11 bg-neutral-100 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between">
          <div>
            {step === 1 && (
              <button
                onClick={downloadWindowsSetupExe}
                className="text-xs font-mono text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Download className="w-3 h-3" />
                <span>Прямая загрузка EXE</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1 rounded text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  Далее
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-1 rounded text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white text-xs cursor-pointer"
                >
                  Назад
                </button>
                <button
                  onClick={handleStartInstallation}
                  className="px-4 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  Установить
                </button>
              </>
            )}

            {step === 4 && (
              <button
                onClick={onClose}
                className="px-5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
