import React, { useState } from 'react';
import {
  GraduationCap,
  Flame,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Moon,
  Sun,
  Palette,
  Bell,
  Menu,
  X,
  Smartphone,
  ChevronDown,
  Sparkles,
  Timer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, AccentColor } from '../../types';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenPomodoro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenPomodoro
}) => {
  const {
    preferences,
    updatePreferences,
    academicGoal,
    isOnline,
    syncStatus,
    syncNow,
    deadlines,
    setActiveTab
  } = useApp();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const upcomingDeadlinesCount = deadlines.filter(
    d => d.status !== 'completed' && new Date(d.dueDate) >= new Date()
  ).length;

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['midnight', 'dark', 'light', 'sepia'];
    const nextIdx = (modes.indexOf(preferences.theme) + 1) % modes.length;
    updatePreferences({ theme: modes[nextIdx] });
  };

  const accents: { id: AccentColor; label: string; bg: string }[] = [
    { id: 'rose', label: 'Rose Quartz', bg: 'bg-rose-500' },
    { id: 'pink', label: 'Blush Blossom', bg: 'bg-pink-500' },
    { id: 'lavender', label: 'Lavender Dream', bg: 'bg-purple-400' },
    { id: 'peach', label: 'Peach Sorbet', bg: 'bg-orange-300' },
    { id: 'coral', label: 'Coral Radiance', bg: 'bg-rose-400' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-md transition-colors bg-neutral-950/85 border-rose-950/40 text-white">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-200 hover:bg-neutral-800 md:hidden transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-teal-500/20 p-0.5 border border-rose-500/30 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <img
              src="/assets/aistudio/image_e3bbf901.png"
              alt="apnabhai logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-rose-200 via-pink-100 to-fuchsia-300 bg-clip-text text-transparent">
                apnabhai
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                B.Tech CS
              </span>
            </div>
            <div className="text-[11px] text-rose-200/60 hidden sm:block">
              Study Companion • GLA University
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-neutral-400 bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search notes, formulas, topics, deadlines...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Pomodoro button */}
        <button
          onClick={onOpenPomodoro}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-850 hover:bg-neutral-800 text-rose-200 border border-rose-500/20 hover:border-rose-500/40 transition"
          title="Open Focus Pomodoro Timer"
        >
          <Timer className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Study Streak */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 cursor-pointer hover:bg-rose-500/20 transition"
          title={`${academicGoal.studyStreakDays} Day Study Streak`}
        >
          <Flame className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
          <span>{academicGoal.studyStreakDays}d Streak</span>
        </div>

        {/* Sync Status Button */}
        <button
          onClick={syncNow}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/50 transition"
          title={isOnline ? `Cloud synced: ${preferences.lastSyncedAt}` : 'Offline Mode active'}
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-pink-400 animate-spin" />
          ) : isOnline ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden md:inline">
            {syncStatus === 'syncing' ? 'Syncing...' : isOnline ? 'Synced' : 'Offline'}
          </span>
        </button>

        {/* Theme and Color Customizer Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg text-rose-300 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-rose-500/30 transition"
            title="Appearance & Accent Palette"
          >
            <Palette className="w-4 h-4 text-pink-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900 border border-rose-950/60 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-semibold text-rose-300/80 uppercase tracking-wider mb-2">
                Theme Mode
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {(['midnight', 'dark', 'light', 'sepia'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      updatePreferences({ theme: mode });
                      setShowThemeMenu(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs capitalize text-left flex items-center justify-between border transition ${
                      preferences.theme === mode
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 font-semibold'
                        : 'bg-neutral-850/60 text-neutral-300 border-transparent hover:bg-neutral-800'
                    }`}
                  >
                    <span>{mode}</span>
                    {preferences.theme === mode && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-rose-300/80 uppercase tracking-wider mb-2">
                Feminine Palette
              </div>
              <div className="flex items-center justify-between gap-1">
                {accents.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      updatePreferences({ accent: acc.id });
                      setShowThemeMenu(false);
                    }}
                    title={acc.label}
                    className={`w-7 h-7 rounded-full ${acc.bg} transition-transform flex items-center justify-center ${
                      preferences.accent === acc.id ? 'ring-2 ring-white scale-110 shadow-lg shadow-rose-500/30' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {preferences.accent === acc.id && (
                      <span className="w-2 h-2 rounded-full bg-white shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Deadlines indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition relative"
            title="Deadlines & Alerts"
          >
            <Bell className="w-4 h-4" />
            {upcomingDeadlinesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border border-neutral-800 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-300">
                  Upcoming Submissions ({upcomingDeadlinesCount})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('deadlines');
                    setShowNotifications(false);
                  }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {deadlines
                  .filter(d => d.status !== 'completed')
                  .slice(0, 4)
                  .map(d => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setActiveTab('deadlines');
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800/80 cursor-pointer transition text-left"
                    >
                      <div className="text-xs font-medium text-white truncate">{d.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                        <span className="text-amber-400 font-medium">Due {d.dueDate}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {d.type}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 pl-2 border-l border-neutral-800 cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
            alt="Abhi Chaudhary"
            className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40 object-cover"
          />
        </div>
      </div>
    </header>
  );
};
