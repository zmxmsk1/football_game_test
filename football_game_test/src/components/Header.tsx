import React from 'react';
import { Volume2, VolumeX, Settings as SettingsIcon } from 'lucide-react';
import { playSound } from '../utils/audio';

export type ActiveTab = 'dashboard' | 'attributes' | 'training' | 'standings' | 'transfers' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerName: string;
  season: string;
  round: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  season,
  round,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'attributes', label: '선수 능력치' },
    { id: 'training', label: '훈련 센터' },
    { id: 'standings', label: '리그 순위' },
    { id: 'transfers', label: '계약 & 이적' },
    { id: 'history', label: '커리어 기록' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Brand title, single line text */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onTabChange('dashboard');
          }}
          className="font-athletic text-2xl font-black tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer text-left"
        >
          PLAYER CAREER
        </button>
        <span className="hidden sm:inline text-xs text-slate-500 font-medium">
          {season} · R{round}
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              playSound('click', soundEnabled);
              onTabChange(item.id);
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === item.id
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action area */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            onToggleSound();
            playSound('click', !soundEnabled);
          }}
          aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
          title={soundEnabled ? '사운드 켜짐' : '사운드 꺼짐'}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onOpenSettings();
          }}
          className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>게임 설정</span>
        </button>
      </div>
    </header>
    {/* Mobile sub navigation bar */}
    <nav className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-slate-950 border-b border-slate-900 scrollbar-none text-xs">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            playSound('click', soundEnabled);
            onTabChange(item.id);
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === item.id
              ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </>
  );
};
