import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Check, 
  Sliders, 
  Volume2, 
  Layers, 
  Bell,
  Sun,
  Moon,
  Key,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  ExternalLink,
  Upload,
  FileText,
  Chrome,
  Globe,
  Code2,
  Copy
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

  // Cookies state
  const [cookieInput, setCookieInput] = useState('');
  const [hasServerCookies, setHasServerCookies] = useState(false);
  const [isCookieSaving, setIsCookieSaving] = useState(false);
  const [isTestingCookies, setIsTestingCookies] = useState(false);
  const [cookieStatusMsg, setCookieStatusMsg] = useState('');
  const [cookieTestResult, setCookieTestResult] = useState<'success' | 'warning' | null>(null);
  const [activeBrowserTab, setActiveBrowserTab] = useState<'chrome' | 'edge' | 'devtools'>('chrome');
  const [showCookieGuide, setShowCookieGuide] = useState(true);
  const [copiedSample, setCopiedSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/cookies-status')
        .then(r => r.json())
        .then(data => setHasServerCookies(Boolean(data.hasCookies)))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 350);
  };

  const handleSaveCookies = async (clear: boolean = false) => {
    setIsCookieSaving(true);
    setCookieStatusMsg('');
    setCookieTestResult(null);
    try {
      const res = await fetch('/api/save-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: clear ? '' : cookieInput })
      });
      const data = await res.json();
      setHasServerCookies(data.hasCookies);
      setCookieStatusMsg(data.hasCookies ? 'Cookies сохранены. Рекомендуется нажать «Проверить YouTube».' : 'Cookies удалены');
      setCookieTestResult(data.hasCookies ? 'success' : null);
      if (clear || data.hasCookies) setCookieInput('');
    } catch {
      setCookieStatusMsg('Ошибка сохранения cookies');
      setCookieTestResult('warning');
    } finally {
      setIsCookieSaving(false);
    }
  };

  const handleTestCookies = async () => {
    setIsTestingCookies(true);
    setCookieStatusMsg('Проверка соединения с YouTube...');
    setCookieTestResult(null);
    try {
      const res = await fetch('/api/test-cookies', { method: 'POST' });
      const data = await res.json();
      setCookieStatusMsg(data.message || (data.success ? 'Авторизация YouTube подтверждена!' : 'Проверка не пройдена'));
      setCookieTestResult(data.success ? 'success' : 'warning');
    } catch (err: any) {
      setCookieStatusMsg('Ошибка связи с сервером при проверке: ' + err.message);
      setCookieTestResult('warning');
    } finally {
      setIsTestingCookies(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCookieInput(text);
        setCookieStatusMsg(`Файл "${file.name}" выбран (${(file.size / 1024).toFixed(1)} КБ). Нажмите «Применить cookies»`);
        setCookieTestResult('success');
      }
    };
    reader.readAsText(file);
  };

  const copySampleFormat = () => {
    const sample = `# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t1799999999\tVISITOR_INFO1_LIVE\txxxxxxxxxxx\n.youtube.com\tTRUE\t/\tTRUE\t1799999999\t__Secure-3PSID\tyyyyyyyyyyy`;
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col text-xs select-none">
        {/* Header */}
        <div className="h-9 bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-3 text-neutral-800 dark:text-neutral-200">
          <div className="flex items-center gap-2 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Параметры A.U.R.A. Converter Studio</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* YouTube Cookies & Bot-Bypass Section */}
          <div className="p-3.5 rounded-md bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-xs">
                <Key className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Авторизация YouTube (Обход проверки бота)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasServerCookies ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cookies активны</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    Не настроено
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowCookieGuide(!showCookieGuide)}
                  className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showCookieGuide ? 'Скрыть инструкцию' : 'Инструкция Chrome / Edge'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Если YouTube блокирует скачивание ошибкой <i>«Sign in to confirm you’re not a bot»</i> или <i>«403 Forbidden»</i>, добавьте сессионные cookies из вашего браузера, чтобы сервер скачивал видео от имени подтверждённого пользователя.
            </p>

            {/* Interactive Browser Guides */}
            {showCookieGuide && (
              <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 space-y-3">
                {/* Browser Tabs */}
                <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-850 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveBrowserTab('chrome')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      activeBrowserTab === 'chrome'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <Chrome className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Chrome</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBrowserTab('edge')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      activeBrowserTab === 'edge'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Microsoft Edge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBrowserTab('devtools')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      activeBrowserTab === 'devtools'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>F12 DevTools (Без расширений)</span>
                  </button>
                </div>

                {/* Google Chrome Instructions */}
                {activeBrowserTab === 'chrome' && (
                  <div className="space-y-2 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>Инструкция для Google Chrome:</span>
                      <a
                        href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Страница расширения в Chrome Web Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        <b>Шаг 1:</b> Установите официальное расширение{' '}
                        <a
                          href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-600 dark:text-blue-400 underline"
                        >
                          Get cookies.txt LOCALLY
                        </a>{' '}
                        в браузере Chrome (оно работает локально и не передаёт ваши данные).
                      </li>
                      <li>
                        <b>Шаг 2:</b> Откройте вкладку{' '}
                        <a
                          href="https://www.youtube.com"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-neutral-900 dark:text-white underline"
                        >
                          youtube.com
                        </a>{' '}
                        в Chrome (убедитесь, что вы вошли в свой аккаунт Google).
                      </li>
                      <li>
                        <b>Шаг 3:</b> Нажмите на иконку расширения в панели Chrome (значок пазла вверху справа) и выберите <b>Get cookies.txt LOCALLY</b>.
                      </li>
                      <li>
                        <b>Шаг 4:</b> В открывшемся окне расширения нажмите кнопку <b>Export</b> (файл <code>cookies.txt</code> сохранится в папку «Загрузки») или просто нажмите <b>Copy</b>.
                      </li>
                      <li>
                        <b>Шаг 5:</b> Нажмите ниже кнопку <b>«Загрузить файл cookies.txt»</b> (или вставьте скопированный текст в поле) и нажмите <b>«Применить cookies»</b>.
                      </li>
                    </ol>
                  </div>
                )}

                {/* Microsoft Edge Instructions */}
                {activeBrowserTab === 'edge' && (
                  <div className="space-y-2 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>Инструкция для Microsoft Edge:</span>
                      <a
                        href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Установить в Edge из Интернет-магазина</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        <b>Шаг 1:</b> В браузере Microsoft Edge перейдите по ссылке на расширение{' '}
                        <a
                          href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-cyan-600 dark:text-cyan-400 underline"
                        >
                          Get cookies.txt LOCALLY
                        </a>{' '}
                        и нажмите <b>«Получить»</b> (если Edge попросит, разрешите установку расширений из других магазинов).
                      </li>
                      <li>
                        <b>Шаг 2:</b> Откройте сайт{' '}
                        <a
                          href="https://www.youtube.com"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-neutral-900 dark:text-white underline"
                        >
                          youtube.com
                        </a>{' '}
                        в Edge, где вы авторизованы в аккаунте.
                      </li>
                      <li>
                        <b>Шаг 3:</b> Нажмите значок расширений в правом верхнем углу Edge (значок пазла) и кликните на <b>Get cookies.txt LOCALLY</b>.
                      </li>
                      <li>
                        <b>Шаг 4:</b> Нажмите кнопку <b>Export</b> — файл <code>cookies.txt</code> автоматически скачается в папку Загрузки Edge.
                      </li>
                      <li>
                        <b>Шаг 5:</b> Нажмите кнопку <b>«Загрузить файл cookies.txt»</b> ниже и выберите скачанный файл.
                      </li>
                    </ol>
                  </div>
                )}

                {/* DevTools (F12) Instructions */}
                {activeBrowserTab === 'devtools' && (
                  <div className="space-y-2 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <div className="font-bold text-neutral-900 dark:text-white">
                      Способ через инструменты разработчика (без установки расширений):
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>Откройте <code>youtube.com</code> в Chrome или Edge.</li>
                      <li>Нажмите клавишу <b>F12</b> (или <code>Ctrl + Shift + I</code>) для вызова консоли разработчика.</li>
                      <li>Перейдите во вкладку <b>Сеть (Network)</b>, обновите страницу (<code>F5</code>).</li>
                      <li>Выберите самый первый запрос <code>www.youtube.com</code> в списке.</li>
                      <li>Справа в блоке <b>Заголовки запроса (Request Headers)</b> найдите строку <code>Cookie:</code>.</li>
                      <li>Скопируйте всё её значение (текст после <code>Cookie:</code>), вставьте в поле ниже и сохраните.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Upload File and Textarea Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                  <span>Загрузить файл cookies.txt</span>
                </button>

                <button
                  type="button"
                  onClick={copySampleFormat}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Скопировать тестовый шаблон формата Netscape"
                >
                  {copiedSample ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSample ? 'Шаблон скопирован' : 'Пример формата'}</span>
                </button>
              </div>

              <textarea
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="# Netscape HTTP Cookie File&#10;# Вставьте содержимое cookies.txt или выберите файл выше...&#10;.youtube.com&#9;TRUE&#9;/&#9;TRUE&#9;1799999999&#9;VISITOR_INFO1_LIVE&#9;..."
                rows={4}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded p-2 text-neutral-900 dark:text-neutral-200 font-mono text-[10px] focus:outline-none focus:border-neutral-500 resize-y"
              />

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-2">
                  {hasServerCookies && (
                    <button
                      type="button"
                      onClick={handleTestCookies}
                      disabled={isTestingCookies}
                      className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isTestingCookies ? 'animate-spin text-neutral-500' : 'text-emerald-500'}`} />
                      <span>{isTestingCookies ? 'Проверка...' : 'Проверить YouTube'}</span>
                    </button>
                  )}
                  {cookieStatusMsg && (
                    <span className={`text-[11px] font-mono font-medium ${
                      cookieTestResult === 'success' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : cookieTestResult === 'warning' 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {cookieStatusMsg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {hasServerCookies && (
                    <button
                      type="button"
                      onClick={() => handleSaveCookies(true)}
                      disabled={isCookieSaving || isTestingCookies}
                      className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Удалить cookies</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveCookies(false)}
                    disabled={isCookieSaving || !cookieInput.trim()}
                    className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Применить cookies</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output Folder */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 block">
              Рабочий каталог Windows:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.defaultFolder}
                onChange={(e) => setFormData({ ...formData, defaultFolder: e.target.value })}
                className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={onSelectRealDirectory}
                className="px-3 py-1.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Обзор...
              </button>
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 block">
              Формат именования:
            </label>
            <select
              value={formData.namingPattern}
              onChange={(e) => setFormData({ ...formData, namingPattern: e.target.value as AppSettings['namingPattern'] })}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded p-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-xs focus:outline-none"
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
              <label className="text-neutral-700 dark:text-neutral-400 block font-medium">Видео по умолчанию:</label>
              <select
                value={formData.defaultVideoRes}
                onChange={(e) => setFormData({ ...formData, defaultVideoRes: e.target.value as VideoResolution })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded p-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-xs"
              >
                <option value="2160p">4K (2160p)</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-700 dark:text-neutral-400 block font-medium">Аудио по умолчанию:</label>
              <select
                value={formData.defaultAudioBitrate}
                onChange={(e) => setFormData({ ...formData, defaultAudioBitrate: e.target.value as AudioBitrate })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded p-1.5 text-neutral-900 dark:text-neutral-200 font-mono text-xs"
              >
                <option value="320k">320 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="lossless">Lossless</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1 border-t border-neutral-200 dark:border-neutral-850">
            <label className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 cursor-pointer">
              <span className="text-neutral-800 dark:text-neutral-300 font-medium">Нормализация громкости аудио (+3 dB)</span>
              <input
                type="checkbox"
                checked={formData.audioNormalization}
                onChange={(e) => setFormData({ ...formData, audioNormalization: e.target.checked })}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 cursor-pointer">
              <span className="text-neutral-800 dark:text-neutral-300 font-medium">Предпочитать 60 FPS для видео</span>
              <input
                type="checkbox"
                checked={formData.prefer60fps}
                onChange={(e) => setFormData({ ...formData, prefer60fps: e.target.checked })}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 cursor-pointer">
              <span className="text-neutral-800 dark:text-neutral-300 font-medium">Оповещение Windows по завершении</span>
              <input
                type="checkbox"
                checked={formData.notifyOnComplete}
                onChange={(e) => setFormData({ ...formData, notifyOnComplete: e.target.checked })}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
              />
            </label>
          </div>

          {/* Theme */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-850 flex items-center justify-between">
            <span className="text-neutral-800 dark:text-neutral-300 font-semibold">Тема интерфейса:</span>
            <button
              onClick={onToggleTheme}
              className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 cursor-pointer font-medium"
            >
              {isDark ? 'Светлая' : 'Темная'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 bg-neutral-100 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 px-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={handleSave}
            className="px-3.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold cursor-pointer shadow-xs"
          >
            {isSaved ? 'Сохранено' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
};
