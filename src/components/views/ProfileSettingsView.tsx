import React, { useState } from 'react';
import {
  User as UserIcon,
  Settings,
  Sun,
  Moon,
  Laptop,
  Clock,
  Download,
  RotateCcw,
  Shield,
  Save,
  CheckCircle2,
  LogOut,
  Sparkles,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudy } from '../../context/StudyContext';

export const ProfileSettingsView: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { studyStats, savedNotes, savedDecks, quizAttempts, showToast } = useStudy();

  const [nameInput, setNameInput] = useState(user?.name || 'Student');
  const [goalHours, setGoalHours] = useState(user?.studyGoalHours || 4);
  const [role, setRole] = useState<'student' | 'educator'>(user?.role || 'student');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput,
      studyGoalHours: goalHours,
      role
    });
    setIsSaved(true);
    showToast('Profile and study preferences updated!', 'success');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      user,
      studyStats,
      savedNotes,
      savedDecks,
      quizAttempts,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_study_buddy_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported complete study data archive!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Learning Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your study cadence, interface appearance, and manage your academic portfolio.
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-blue-500" />
          <span>Student Profile Information</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30"
            />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.name}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                Joined: {new Date(user?.joinedAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="student">Student (Undergraduate / Graduate)</option>
                <option value="educator">Educator / Teaching Assistant</option>
              </select>
            </div>
          </div>

          {/* Daily Study Goal Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Daily Study Goal:</span>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {goalHours} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={goalHours}
              onChange={e => setGoalHours(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Hour</span>
              <span>4 Hours (Recommended)</span>
              <span>10 Hours</span>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Preferences Saved' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Theme Selection */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Interface Theme & Styling</span>
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean high-contrast daytime study' },
            { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Late night low eye-strain studying' },
            { id: 'system', label: 'System Default', icon: Laptop, desc: 'Syncs with your device OS settings' }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-2xl border text-left transition space-y-2 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</div>
                <div className="text-[10px] text-slate-400">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Data Portability & Account Controls</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Export Study Materials
            </div>
            <div className="text-[11px] text-slate-500">
              Download your complete library of notes, quiz attempts, and flashcards as a portable JSON file.
            </div>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40">
          <div>
            <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Session & Logout
            </div>
            <div className="text-[11px] text-slate-500">
              Safely end your session on this browser device.
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Academic Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500">
        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span>Factual Verification Policy: AI Study Buddy assists synthesis; verify exam-critical formulas against accredited course materials.</span>
      </div>
    </div>
  );
};
