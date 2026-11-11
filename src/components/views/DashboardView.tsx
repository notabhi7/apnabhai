import React from 'react';
import {
  Sparkles,
  Brain,
  HelpCircle,
  BookOpen,
  Layers,
  Clock,
  Award,
  TrendingUp,
  Flame,
  ArrowRight,
  ChevronRight,
  Cpu,
  Target
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
    savedDecks,
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
      desc: 'How Query, Key, and Value matrices capture semantic context.'
    },
    {
      title: 'Process Deadlocks & Banker’s Algorithm',
      category: 'Operating Systems',
      page: 'ai-tutor' as PageView,
      desc: 'Mutual exclusion, hold & wait, and avoidance guarantees.'
    },
    {
      title: 'Zero-Shot vs Few-Shot In-Context Prompting',
      category: 'Core AI Topics',
      page: 'ai-concepts' as PageView,
      desc: 'Guiding output structure using prompt demonstration pairs.'
    },
    {
      title: 'AI Hallucinations & Retrieval Grounding',
      category: 'Core AI Topics',
      page: 'ai-concepts' as PageView,
      desc: 'Preventing fabricated facts through RAG architecture.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs border border-white/20">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{studyStats.studyStreakDays}-Day Study Streak Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
              Accelerate your learning curve with multi-level concept breakdowns, adaptive practice exams, and active recall.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setActivePage('ai-tutor')}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-white text-indigo-700 hover:bg-blue-50 shadow-md transition flex items-center gap-1.5"
              >
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>Explain Concept</span>
              </button>

              <button
                onClick={() => setActivePage('quiz-generator')}
                className="px-4 py-2 rounded-xl font-semibold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-blue-200" />
                <span>Practice Quiz</span>
              </button>

              <button
                onClick={() => setActivePage('ai-concepts')}
                className="px-4 py-2 rounded-xl font-semibold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 transition flex items-center gap-1.5"
              >
                <Cpu className="w-4 h-4 text-violet-200" />
                <span>AI Concepts</span>
              </button>
            </div>
          </div>

          {/* Daily Goal Mini Radial */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col justify-between min-w-[210px]">
            <div className="text-xs text-blue-100 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-200" />
                Daily Target
              </span>
              <span className="text-[11px] font-mono font-bold text-white">{progressPercent}%</span>
            </div>

            <div className="my-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{studyHours}</span>
              <span className="text-xs text-blue-200 font-medium">/ {targetHours} hrs</span>
            </div>

            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {studyStats.studyStreakDays} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">Consistent</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Topics Explored</span>
            <Brain className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {studyStats.topicsExplored}
          </div>
          <div className="text-[10px] text-blue-500 font-semibold mt-0.5">Active recall</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Quizzes Taken</span>
            <HelpCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {studyStats.quizzesCompleted}
          </div>
          <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">{studyStats.avgQuizScore}% Avg</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Revision Notes</span>
            <BookOpen className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {savedNotes.length}
          </div>
          <div className="text-[10px] text-violet-500 font-semibold mt-0.5">Ready for exams</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cards Mastered</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {studyStats.flashcardsMastered}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Spaced repetition</div>
        </div>
      </div>

      {/* 3. WORKSPACE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Actions + Recent Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Study Workspaces
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setActivePage('ai-tutor')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left transition group space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  Understand Concept
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Intuitive analogies and technical formula breakdowns.
                </p>
              </button>

              <button
                onClick={() => setActivePage('quiz-generator')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-left transition group space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                  Practice Exam Quiz
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  MCQs, True/False, and conceptual Short-Answer questions.
                </p>
              </button>

              <button
                onClick={() => setActivePage('revision-notes')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 text-left transition group space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition">
                  Revision Cheatsheets
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Structured summaries, terms, and Markdown downloads.
                </p>
              </button>

              <button
                onClick={() => setActivePage('flashcards')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-left transition group space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Active Recall Cards
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  3D card flips with Leitner spaced repetition.
                </p>
              </button>
            </div>
          </div>

          {/* Recent Quiz Scores */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Recent Exam Scores</span>
              </h3>
              <button
                onClick={() => setActivePage('study-library')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
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
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {att.topic}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(att.completedAt).toLocaleDateString()} • {att.score}/{att.totalPoints} pts
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      {att.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-xs text-slate-400">
                  No quizzes completed yet. Test yourself on any concept!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Topics & AI Core curriculum (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recommended Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recommended Topics
            </h3>

            <div className="space-y-2.5">
              {recommendedTopics.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => setActivePage(topic.page)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      {topic.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition truncate">
                      {topic.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {topic.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Core AI Section Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 text-white space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Core AI Masterclass</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Prompting, LLMs, Zero-Shot & Hallucinations
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Interactive playground sandbox and self-check challenges on core AI mechanisms.
            </p>
            <button
              onClick={() => setActivePage('ai-concepts')}
              className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center gap-1.5"
            >
              <span>Open Masterclass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
