import React from 'react';
import { 
  Zap, 
  ListMusic, 
  Scissors, 
  History, 
  Settings, 
  FolderOpen
} from 'lucide-react';

export type NavTab = 'single' | 'batch' | 'trim' | 'history' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  historyCount: number;
  batchCount: number;
  currentFolder: string;
  onOpenExplorer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  historyCount,
  batchCount,
  currentFolder,
  onOpenExplorer,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'single',
      label: 'Конвертер',
      icon: <Zap className="w-3.5 h-3.5" />
    },
    {
      id: 'batch',
      label: 'Пакетная очередь',
      icon: <ListMusic className="w-3.5 h-3.5" />,
      badge: batchCount > 0 ? batchCount : undefined
    },
    {
      id: 'trim',
      label: 'Обрезка медиа',
      icon: <Scissors className="w-3.5 h-3.5" />
    },
    {
      id: 'history',
      label: 'История и файлы',
      icon: <History className="w-3.5 h-3.5" />,
      badge: historyCount > 0 ? historyCount : undefined
    },
    {
      id: 'settings',
      label: 'Конфигурация',
      icon: <Settings className="w-3.5 h-3.5" />
    }
  ];

  return (
    <aside className="w-56 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-3 select-none shrink-0">
      <div className="space-y-1">
        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Модули
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white font-medium border border-neutral-750'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-neutral-400'}>
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-neutral-800 text-neutral-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Minimal Storage & Explorer Info */}
      <div className="pt-3 border-t border-neutral-900 space-y-2">
        <div className="p-2 rounded bg-neutral-900/50 border border-neutral-850 text-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Каталог</span>
            <button
              onClick={onOpenExplorer}
              className="text-neutral-300 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <FolderOpen className="w-2.5 h-2.5" />
              <span>Папка</span>
            </button>
          </div>
          <div className="font-mono text-[10px] text-neutral-300 truncate">
            {currentFolder.split('\\').pop() || 'Downloads'}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 font-mono">
          <span>A.U.R.A. Engine</span>
          <span>v2.8</span>
        </div>
      </div>
    </aside>
  );
};
