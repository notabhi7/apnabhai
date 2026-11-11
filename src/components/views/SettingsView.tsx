import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sliders,
  Bell,
  Volume2,
  Trash2,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, AccentColor } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    academicGoal,
    updateAcademicGoal,
    exportBackup,
    importBackup,
    syncNow,
    syncStatus,
    isOnline
  } = useApp();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const themeModes: { id: ThemeMode; label: string; desc: string }[] = [
    { id: 'midnight', label: 'Midnight Plum OLED', desc: 'Deep obsidian with soft rose undertones for late night study' },
    { id: 'dark', label: 'Velvet Rose Dark', desc: 'Rich charcoal-berry palette with high-contrast pastel text' },
    { id: 'light', label: 'Blush Daylight', desc: 'Crisp petal-white and soft cream paper theme' },
    { id: 'sepia', label: 'Warm Cherry Sepia', desc: 'Soft warm vintage tone optimized for eye relaxation' }
  ];

  const accents: { id: AccentColor; label: string; bg: string }[] = [
    { id: 'rose', label: 'Rose Quartz', bg: 'bg-rose-500' },
    { id: 'pink', label: 'Cherry Blossom', bg: 'bg-pink-500' },
    { id: 'lavender', label: 'Lavender Dream', bg: 'bg-purple-400' },
    { id: 'peach', label: 'Peach Sorbet', bg: 'bg-orange-300' },
    { id: 'coral', label: 'Coral Radiance', bg: 'bg-rose-400' }
  ];

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importBackup(importText.trim());
    if (ok) {
      setImportStatus('Backup restored successfully!');
      setImportText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Invalid JSON backup file. Please check format.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Settings, Customization & Cross-Platform Sync
        </h2>
        <p className="text-xs text-neutral-400">
          Personalize themes, offline access, study timer defaults, and sync across laptops, phones, and tablets
        </p>
      </div>

      {/* Cross-Platform Synchronization Card */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Cross-Platform Sync & Offline Engine</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instant replication between your Android/iOS mobile, iPad, and development workstation
            </p>
          </div>

          <button
            onClick={syncNow}
            disabled={syncStatus === 'syncing'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud Now'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[11px] text-neutral-400">Current Device Token</span>
            <div className="text-xs font-mono font-bold text-indigo-400 truncate">
              {preferences.syncDeviceId}
            </div>
            <span className="text-[10px] text-neutral-500">Registered Workstation</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[11px] text-neutral-400">Cloud Sync Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold text-white">
                {isOnline ? 'Online & Synchronized' : 'Offline Mode (Local Storage)'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500">Last sync: {preferences.lastSyncedAt}</span>
          </div>

          {/* Offline Mode Toggle */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">Simulate Offline Mode</span>
              <p className="text-[10px] text-neutral-400">Test app with zero internet</p>
            </div>
            <button
              onClick={() => updatePreferences({ offlineMode: !preferences.offlineMode })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.offlineMode ? 'bg-amber-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.offlineMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Backup Export / Import */}
        <div className="pt-4 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-400" />
              Export Full Course Backup (.json)
            </h4>
            <p className="text-[11px] text-neutral-400">
              Download all your lecture notes, summaries, deadlines, flashcards, and timetable as a portable file.
            </p>
            <button
              onClick={exportBackup}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition"
            >
              Download Backup File
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              Restore Backup File
            </h4>
            <form onSubmit={handleImportSubmit} className="space-y-2">
              <textarea
                rows={2}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste backup JSON string here to restore..."
                className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 font-mono focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40"
                >
                  Restore Data
                </button>
                {importStatus && (
                  <span className="text-xs text-emerald-400 font-medium">{importStatus}</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Theme & Visual Customization */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Theme & Visual Experience</h3>
        </div>

        {/* Theme Modes */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {themeModes.map(tm => {
              const isSelected = preferences.theme === tm.id;
              return (
                <button
                  key={tm.id}
                  onClick={() => updatePreferences({ theme: tm.id })}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-neutral-950 hover:bg-neutral-850/80 border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{tm.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">{tm.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="pt-4 border-t border-neutral-800">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Accent Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {accents.map(acc => {
              const isSelected = preferences.accent === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => updatePreferences({ accent: acc.id })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                    isSelected
                      ? 'bg-neutral-800 border-neutral-600 shadow'
                      : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${acc.bg} flex-shrink-0`} />
                  <span className="text-xs font-semibold text-white">{acc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Study Habit Defaults */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Study Habit Preferences & Pomodoro Defaults</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Daily Target Study Hours ({preferences.dailyStudyTargetHours} hrs)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={preferences.dailyStudyTargetHours}
              onChange={e => updatePreferences({ dailyStudyTargetHours: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>1 hr (Light)</span>
              <span>4.5 hrs (Balanced)</span>
              <span>10 hrs (Exam Crunch)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Pomodoro Sprint Length ({preferences.pomodoroWorkMins} mins)
            </label>
            <select
              value={preferences.pomodoroWorkMins}
              onChange={e => updatePreferences({ pomodoroWorkMins: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
            >
              <option value={15}>15 Minutes (Quick Focus)</option>
              <option value={25}>25 Minutes (Standard Pomodoro)</option>
              <option value={45}>45 Minutes (Deep Derivation Sprint)</option>
              <option value={60}>60 Minutes (Full Lab Simulation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Pomodoro Break Length ({preferences.pomodoroBreakMins} mins)
            </label>
            <select
              value={preferences.pomodoroBreakMins}
              onChange={e => updatePreferences({ pomodoroBreakMins: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
            >
              <option value={3}>3 Minutes (Micro-break)</option>
              <option value={5}>5 Minutes (Standard)</option>
              <option value={10}>10 Minutes (Hydration & Stretch)</option>
              <option value={15}>15 Minutes (Long Rest)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
