import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, CheckCircle, Flame, Coffee, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const { preferences, logStudySession, subjects } = useApp();
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(preferences.pomodoroWorkMins * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [ambientSound, setAmbientSound] = useState<'none' | 'whitenoise' | 'rain' | 'binaural'>('none');
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(3);

  // Audio simulation / web audio synth for white noise or chime
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    setTimeLeft(mode === 'work' ? preferences.pomodoroWorkMins * 60 : preferences.pomodoroBreakMins * 60);
  }, [preferences.pomodoroWorkMins, preferences.pomodoroBreakMins, mode]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === 'work') {
        logStudySession(preferences.pomodoroWorkMins, selectedSubjectId);
        setSessionsCompletedToday(prev => prev + 1);
        setMode('break');
        setTimeLeft(preferences.pomodoroBreakMins * 60);
      } else {
        setMode('work');
        setTimeLeft(preferences.pomodoroWorkMins * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, preferences.pomodoroWorkMins, preferences.pomodoroBreakMins, selectedSubjectId, logStudySession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? preferences.pomodoroWorkMins * 60 : preferences.pomodoroBreakMins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = mode === 'work' ? preferences.pomodoroWorkMins * 60 : preferences.pomodoroBreakMins * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            {mode === 'work' ? <Flame className="w-4 h-4 fill-indigo-400" /> : <Coffee className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Engineering Focus Pomodoro</h3>
            <p className="text-[11px] text-neutral-400">Deep study sprints with auto progress logging</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-neutral-950 rounded-2xl mb-6 border border-neutral-800">
          <button
            onClick={() => {
              setMode('work');
              setIsRunning(false);
              setTimeLeft(preferences.pomodoroWorkMins * 60);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
              mode === 'work'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Study Sprint ({preferences.pomodoroWorkMins}m)
          </button>
          <button
            onClick={() => {
              setMode('break');
              setIsRunning(false);
              setTimeLeft(preferences.pomodoroBreakMins * 60);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
              mode === 'break'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rest Break ({preferences.pomodoroBreakMins}m)
          </button>
        </div>

        {/* Big Circular Clock */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="84"
                className="text-neutral-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                className={mode === 'work' ? 'text-rose-500' : 'text-pink-400'}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {formattedTime}
              </span>
              <span className="text-[11px] font-medium text-rose-300/80 mt-1 uppercase tracking-wider">
                {mode === 'work' ? 'Sprint In Progress' : 'Rest & Refresh'}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Tagging */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
            Log time to subject:
          </label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-rose-500"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:to-fuchsia-400 text-white shadow-rose-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom stats */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Completed Today: <strong className="text-white">{sessionsCompletedToday} sprints</strong></span>
          <span className="text-emerald-400 font-medium">+{sessionsCompletedToday * preferences.pomodoroWorkMins}m logged</span>
        </div>
      </div>
    </div>
  );
};
