import React from 'react';
import {
  Brain,
  HelpCircle,
  BookOpen,
  Layers,
  TrendingUp,
  Flame,
  ChevronRight,
  Cpu,
  Target,
  Orbit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { PageView } from '../../types';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const {
    setActivePage,
    studyStats,
    savedNotes,
    quizAttempts
  } = useStudy();

  const studyHours = (studyStats.totalMinutesStudied / 60).toFixed(1);
  const targetHours = user?.studyGoalHours || 4;
  const progressPercent = Math.min(100, Math.round((Number(studyHours) / targetHours) * 100));

  const recommendedTopics = [
    {
      title: 'Attention Mechanism in Transformers',
      category: 'Deep Learning',
      page: 'ai-tutor' as PageView,
      desc: 'How Query, Key, and Value matrices capture semantic context.',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Process Deadlocks & Banker’s Algorithm',
      category: 'Operating Systems',
      page: 'ai-tutor' as PageView,
      desc: 'Mutual exclusion, hold & wait, and avoidance guarantees.',
      accent: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Zero-Shot vs Few-Shot In-Context Prompting',
      category: 'Core AI Topics',
      page: 'ai-concepts' as PageView,
      desc: 'Guiding output structure using prompt demonstration pairs.',
      accent: 'text-pink-600 dark:text-pink-400'
    },
    {
      title: 'AI Hallucinations & Retrieval Grounding',
      category: 'Core AI Topics',
      page: 'ai-concepts' as PageView,
      desc: 'Preventing fabricated facts through RAG architecture.',
      accent: 'text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. HIGH-CONTRAST EDITORIAL WORKSPACE HERO */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-9 bg-zinc-950 text-white lift-shadow">
        {/* Saturated Geometric Accents */}
        <svg viewBox="0 0 360 240" fill="none" className="absolute right-0 top-0 h-full w-auto opacity-30 pointer-events-none select-none">
          <circle cx="290" cy="60" r="95" fill="#2563EB" />
          <circle cx="215" cy="185" r="70" fill="#EC4899" />
          <rect x="295" y="135" width="90" height="90" rx="28" fill="#F97316" />
        </svg>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{studyStats.studyStreakDays}-Day Study Streak Active</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              Accelerate your learning curve with multi-level concept breakdowns, adaptive practice exams, and active recall.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setActivePage('ai-tutor')}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Brain className="w-4 h-4 text-blue-600" />
                <span>Explain Concept</span>
              </button>

              <button
                onClick={() => setActivePage('quiz-generator')}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-4 h-4 text-pink-400" />
                <span>Practice Quiz</span>
              </button>

              <button
                onClick={() => setActivePage('3d-lab')}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Orbit className="w-4 h-4 text-teal-400" />
                <span>3D Neural Lab</span>
              </button>

              <button
                onClick={() => setActivePage('ai-concepts')}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Cpu className="w-4 h-4 text-orange-400" />
                <span>AI Concepts</span>
              </button>
            </div>
          </div>

          {/* Daily Goal Mini Progress Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between min-w-[220px]">
            <div className="text-xs text-zinc-200 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-400" />
                Daily Target
              </span>
              <span className="text-[11px] font-mono font-bold text-white tabular-nums">{progressPercent}%</span>
            </div>

            <div className="my-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-3xl font-extrabold text-white">{studyHours}</span>
              <span className="text-xs text-zinc-300 font-medium">/ {targetHours} hrs</span>
            </div>

            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CRISP WHITE STATS CARDS WITH SATURATED COLOR ICONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400 font-semibold">
            <span>Streak</span>
            <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-2 tabular-nums">
            {studyStats.studyStreakDays} <span className="text-xs font-medium text-zinc-500 dark:text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">Consistent</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400 font-semibold">
            <span>Topics Explored</span>
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-2 tabular-nums">
            {studyStats.topicsExplored}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Active recall</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400 font-semibold">
            <span>Quizzes Taken</span>
            <span className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-2 tabular-nums">
            {studyStats.quizzesCompleted}
          </div>
          <div className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold mt-0.5 tabular-nums">{studyStats.avgQuizScore}% Avg</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400 font-semibold">
            <span>Revision Notes</span>
            <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-2 tabular-nums">
            {savedNotes.length}
          </div>
          <div className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold mt-0.5">Ready for exams</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400 font-semibold">
            <span>Cards Mastered</span>
            <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-2 tabular-nums">
            {studyStats.flashcardsMastered}
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">Spaced repetition</div>
        </div>
      </div>

      {/* 3. WORKSPACE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Actions + Recent Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Study Workspaces
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => setActivePage('ai-tutor')}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 hover:bg-zinc-100 dark:hover:bg-slate-800 text-left transition group space-y-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-950 dark:text-white">
                  Understand Concept
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Intuitive analogies and technical formula breakdowns.
                </p>
              </button>

              <button
                onClick={() => setActivePage('quiz-generator')}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 hover:bg-zinc-100 dark:hover:bg-slate-800 text-left transition group space-y-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-950 dark:text-white">
                  Practice Exam Quiz
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                  MCQs, True/False, and conceptual Short-Answer questions.
                </p>
              </button>

              <button
                onClick={() => setActivePage('revision-notes')}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 hover:bg-zinc-100 dark:hover:bg-slate-800 text-left transition group space-y-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-950 dark:text-white">
                  Revision Cheatsheets
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Structured summaries, terms, and Markdown downloads.
                </p>
              </button>

              <button
                onClick={() => setActivePage('flashcards')}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 hover:bg-zinc-100 dark:hover:bg-slate-800 text-left transition group space-y-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-950 dark:text-white">
                  Active Recall Cards
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                  3D card flips with Leitner spaced repetition.
                </p>
              </button>
            </div>
          </div>

          {/* Recent Quiz Scores */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Recent Exam Scores</span>
              </h3>
              <button
                onClick={() => setActivePage('study-library')}
                className="text-xs text-zinc-950 dark:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {quizAttempts.length > 0 ? (
                quizAttempts.slice(0, 3).map(att => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-slate-950 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-950 dark:text-white truncate">
                          {att.topic}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-slate-400 tabular-nums">
                          {new Date(att.completedAt).toLocaleDateString()} · {att.score}/{att.totalPoints} pts
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-teal-600 dark:text-teal-400 text-xs tabular-nums">
                      {att.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-xs text-zinc-500 dark:text-slate-400">
                  No quizzes completed yet. Test yourself on any concept!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Topics & AI Core curriculum (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recommended Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow space-y-3">
            <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Recommended Topics
            </h3>

            <div className="space-y-2.5">
              {recommendedTopics.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => setActivePage(topic.page)}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-slate-950 hover:bg-zinc-100 dark:hover:bg-slate-800 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${topic.accent}`}>
                      {topic.category}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white transition truncate">
                      {topic.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400 truncate">
                      {topic.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Core AI Section Banner */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-zinc-950 text-white space-y-3 lift-shadow">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-orange-500/35 blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Core AI Masterclass</span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                Prompting, LLMs, Zero-Shot & Hallucinations
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Interactive playground sandbox and self-check challenges on core AI mechanisms.
              </p>
              <button
                onClick={() => setActivePage('ai-concepts')}
                className="mt-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Masterclass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
