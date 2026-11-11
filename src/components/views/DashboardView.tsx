import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CalendarCheck,
  BookOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Timer,
  ChevronRight,
  Users,
  Compass,
  Award,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DashboardViewProps {
  onOpenPomodoro: () => void;
  onOpenNewNote: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenPomodoro, onOpenNewNote }) => {
  const {
    subjects,
    notes,
    deadlines,
    flashcards,
    schedule,
    academicGoal,
    quizAttempts,
    preferences,
    setActiveTab,
    toggleDeadlineStatus,
    toggleScheduleItem,
    setSelectedSubjectId
  } = useApp();

  const [aiNoteInput, setAiNoteInput] = useState('');
  const [aiQuickProcessing, setAiQuickProcessing] = useState(false);

  // Computed metrics
  const upcomingDeadlines = deadlines
    .filter(d => d.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const completedDeadlines = deadlines.filter(d => d.status === 'completed').length;
  const deadlineProgress = deadlines.length > 0 ? Math.round((completedDeadlines / deadlines.length) * 100) : 100;

  const todaySchedule = schedule.slice(0, 3);

  const masteredFlashcards = flashcards.filter(fc => fc.masteryLevel === 2).length;
  const retentionRate = flashcards.length > 0 ? Math.round((masteredFlashcards / flashcards.length) * 100) : 0;

  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          (quizAttempts.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / quizAttempts.length)
        )
      : 84;

  const todayStudyHours = (academicGoal.totalStudyMinutes % 240) / 60; // simulated today progress
  const targetStudyHours = preferences.dailyStudyTargetHours;
  const studyHoursPercent = Math.min(100, Math.round((todayStudyHours / targetStudyHours) * 100));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/70 via-pink-950/30 to-neutral-900 border border-rose-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-60 h-60 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl overflow-hidden bg-white/10 p-1 border border-rose-500/30 shadow-lg shadow-rose-500/20 flex-shrink-0 items-center justify-center">
              <img
                src="/assets/aistudio/image_e3bbf901.png"
                alt="apnabhai mascot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>apnabhai • B.Tech Engineering Study Companion</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-fuchsia-300 bg-clip-text text-transparent">Abhi</span>
              </h1>

              <p className="text-sm text-rose-100/80 leading-relaxed">
                Your semester exams begin in <strong className="text-white font-semibold">7 days</strong>. You have <strong className="text-rose-300">{upcomingDeadlines.length} urgent submissions</strong> and 3 revision blocks scheduled today.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenPomodoro}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:to-fuchsia-400 text-white shadow-lg shadow-rose-500/30 transition hover:scale-105"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Focus Sprint ({preferences.pomodoroWorkMins}m)</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-studio')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-neutral-850 hover:bg-neutral-800 text-rose-200 border border-rose-500/30 transition"
                >
                  <Zap className="w-4 h-4 text-pink-400" />
                  <span>AI Study Studio</span>
                </button>

                <button
                  onClick={onOpenNewNote}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-neutral-850/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>+ New Lecture Note</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic CGPA Widget */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[240px]">
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Academic CGPA
                </span>
                <span className="text-emerald-400 font-bold">Target: {academicGoal.targetCGPA}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{academicGoal.currentCGPA}</span>
                <span className="text-xs text-neutral-400">/ 10.0</span>
                <span className="text-[11px] font-semibold text-emerald-400 ml-auto bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Top 5%
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${(academicGoal.currentCGPA / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{academicGoal.studyStreakDays} Day Streak</div>
                  <div className="text-[11px] text-neutral-400">Consistency multiplier active</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-neutral-400 hover:text-white p-1"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Performance Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Study Target */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-rose-500/30 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Daily Study Target</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">{todayStudyHours.toFixed(1)}h</span>
              <span className="text-xs text-neutral-400"> / {targetStudyHours}h</span>
            </div>
            <span className="text-xs font-semibold text-rose-400">{studyHoursPercent}%</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all"
              style={{ width: `${studyHoursPercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: Flashcards Mastery */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-pink-500/30 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Concept Retention</span>
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">{retentionRate}%</span>
              <span className="text-xs text-neutral-400"> mastered</span>
            </div>
            <span className="text-[11px] text-pink-400 font-medium">
              {masteredFlashcards}/{flashcards.length} cards
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-fuchsia-500 h-full rounded-full transition-all"
              style={{ width: `${retentionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Quiz Performance */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-fuchsia-500/30 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Quiz Accuracy</span>
            <HelpCircle className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">{avgQuizScore}%</span>
              <span className="text-xs text-neutral-400"> GATE Avg</span>
            </div>
            <span className="text-[11px] text-fuchsia-400 font-medium">
              {quizAttempts.length} Attempts
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${avgQuizScore}%` }}
            />
          </div>
        </div>

        {/* Card 4: Attendance Safety */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Class Attendance</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">{academicGoal.attendanceRate}%</span>
              <span className="text-xs text-neutral-400"> avg</span>
            </div>
            <span className="text-[11px] text-amber-400 font-medium">&gt;75% Safe</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${academicGoal.attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Deadlines + Schedule + Subject Syllabus Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Urgent Deadlines */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Critical Deadlines & Exams</h3>
              </div>
              <button
                onClick={() => setActiveTab('deadlines')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>View All ({deadlines.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs">
                  All assignments and exams submitted! Great job.
                </div>
              ) : (
                upcomingDeadlines.map(d => {
                  const sub = subjects.find(s => s.id === d.subjectId);
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-850/80 border border-neutral-800/80 transition flex items-start justify-between gap-3"
                    >
                      <button
                        onClick={() => toggleDeadlineStatus(d.id)}
                        className="mt-0.5 text-neutral-500 hover:text-emerald-400 transition"
                      >
                        {d.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: sub?.color || '#6366F1' }}
                          >
                            {sub?.code || 'CS'}
                          </span>
                          <h4 className="text-xs font-semibold text-white truncate">{d.title}</h4>
                        </div>
                        {d.notes && (
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {d.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end flex-shrink-0">
                        <span className="text-[11px] font-bold text-amber-400">
                          Due {d.dueDate}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 mt-1">
                          {d.type} • {d.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Today's Personalized Timetable */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Today&apos;s Personalized Schedule</h3>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaySchedule.map(item => {
                const sub = subjects.find(s => s.id === item.subjectId);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      item.completed
                        ? 'bg-neutral-950/40 border-neutral-850 opacity-60'
                        : 'bg-neutral-950/70 border-neutral-800/80'
                    }`}
                  >
                    <button
                      onClick={() => toggleScheduleItem(item.id)}
                      className="text-neutral-500 hover:text-emerald-400 transition"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400">{item.timeBlock}</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-xs font-bold text-white">{sub?.name || 'Engineering'}</span>
                      </div>
                      <div className="text-[11px] text-neutral-300 mt-0.5 truncate">
                        {item.focusTopic}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.difficulty === 'High'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      {item.sessionType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Course Syllabus Progress & Social Study Rooms */}
        <div className="space-y-6">
          {/* Syllabus Progress */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Syllabus Completion</h3>
              <span className="text-xs text-neutral-400">4th Semester</span>
            </div>

            <div className="space-y-3">
              {subjects.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setActiveTab('notes');
                  }}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-neutral-200 group-hover:text-indigo-300 transition truncate max-w-[70%]">
                      {sub.code}: {sub.name}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {sub.syllabusProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.syllabusProgress}%`,
                        backgroundColor: sub.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('notes')}
              className="w-full mt-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 rounded-xl transition text-center"
            >
              Organize Notes by Syllabus Module
            </button>
          </div>

          {/* Social Study Groups Mini Box */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Active Study Rooms</h3>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              Collaborate on difficult algorithms and share lecture notes with your classmates.
            </p>

            <div className="space-y-2">
              <div
                onClick={() => setActiveTab('groups')}
                className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-850 border border-neutral-800/80 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">DSA & Competitive Code Room</div>
                  <div className="text-[11px] text-emerald-400">9 peers studying right now</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>

              <div
                onClick={() => setActiveTab('groups')}
                className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-850 border border-neutral-800/80 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">OS & Systems Masters</div>
                  <div className="text-[11px] text-emerald-400">6 peers active</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <button
              onClick={() => setActiveTab('groups')}
              className="w-full mt-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition text-center border border-emerald-500/20"
            >
              Enter Study Groups Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
