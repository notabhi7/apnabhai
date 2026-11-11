import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Deadline, DeadlinePriority, DeadlineType } from '../../types';

interface DeadlinesViewProps {
  onOpenNewDeadlineModal: () => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({ onOpenNewDeadlineModal }) => {
  const {
    deadlines,
    subjects,
    toggleDeadlineStatus,
    deleteDeadline,
    selectedSubjectId,
    setSelectedSubjectId
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter deadlines
  const filtered = deadlines.filter(d => {
    if (selectedSubjectId && d.subjectId !== selectedSubjectId) return false;
    if (statusFilter === 'pending' && d.status === 'completed') return false;
    if (statusFilter === 'completed' && d.status !== 'completed') return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
    return true;
  });

  // Calculate days remaining helper
  const getDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const completedCount = deadlines.filter(d => d.status === 'completed').length;
  const pendingCount = deadlines.filter(d => d.status !== 'completed').length;

  const totalWeightageTracked = deadlines.reduce((acc, d) => acc + (d.weightagePercentage || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-rose-400" />
            Deadlines, Lab Submissions & Exam Schedule
          </h2>
          <p className="text-xs text-neutral-400">
            Keep track of assignment dates, lab evaluations, and mid/end-term exams
          </p>
        </div>

        <button
          onClick={onOpenNewDeadlineModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Pending Submissions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{pendingCount}</div>
          <div className="text-[11px] text-amber-400 mt-1">Requires focus & submission</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Completed Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{completedCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {deadlines.length > 0
              ? `${Math.round((completedCount / deadlines.length) * 100)}% on-time completion`
              : '100%'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Course Weightage Tracked</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalWeightageTracked}%</div>
          <div className="text-[11px] text-indigo-400 mt-1">Internal + External evaluations</div>
        </div>
      </div>

      {/* Filter and Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-1">
          {(['all', 'pending', 'completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="Assignment">Assignment</option>
            <option value="Lab Exam">Lab Exam</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="End-Term">End-Term</option>
            <option value="Project">Project</option>
            <option value="Quiz">Quiz</option>
          </select>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs">
            No deadlines match your active filters.
          </div>
        ) : (
          filtered.map(d => {
            const sub = subjects.find(s => s.id === d.subjectId);
            const daysLeft = getDaysRemaining(d.dueDate);
            const isOverdue = daysLeft < 0 && d.status !== 'completed';
            const isToday = daysLeft === 0 && d.status !== 'completed';

            return (
              <div
                key={d.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  d.status === 'completed'
                    ? 'bg-neutral-900/50 border-neutral-850 opacity-70'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isToday
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-neutral-900 hover:bg-neutral-850/80 border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleDeadlineStatus(d.id)}
                    className="mt-0.5 text-neutral-500 hover:text-emerald-400 transition flex-shrink-0"
                  >
                    {d.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: sub?.color || '#6366F1' }}
                      >
                        {sub?.code || 'CS'}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{d.title}</span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          d.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : d.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {d.priority} Priority
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {d.type}
                      </span>
                    </div>

                    {d.notes && (
                      <p className="text-xs text-neutral-400 line-clamp-2">{d.notes}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
                      <span>Course: {sub?.name}</span>
                      <span>•</span>
                      <span>Weightage: {d.weightagePercentage}%</span>
                      {d.dueTime && (
                        <>
                          <span>•</span>
                          <span>Time: {d.dueTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side urgency badge and delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-200">
                      Due: {d.dueDate}
                    </div>
                    {d.status === 'completed' ? (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        ✓ Completed
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[11px] font-bold text-rose-400">
                        Overdue by {Math.abs(daysLeft)} days
                      </span>
                    ) : isToday ? (
                      <span className="text-[11px] font-extrabold text-amber-400 animate-pulse">
                        Due Today!
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-cyan-400">
                        In {daysLeft} days
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteDeadline(d.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition"
                    title="Delete deadline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
