import React, { useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyScheduleItem } from '../../types';

interface ScheduleViewProps {
  onOpenPomodoro: () => void;
  onOpenNewScheduleModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onOpenPomodoro,
  onOpenNewScheduleModal
}) => {
  const {
    schedule,
    subjects,
    toggleScheduleItem,
    deleteScheduleItem,
    requestSchedulePlan,
    preferences,
    academicGoal
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlanOverview, setAiPlanOverview] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredSchedule = schedule.filter(item => item.day === selectedDay);

  const handleGenerateAISchedule = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await requestSchedulePlan(preferences.dailyStudyTargetHours, academicGoal.targetCGPA);
      if (plan.planOverview) {
        setAiPlanOverview(plan.planOverview);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            Personalized B.Tech Study Timetable
          </h2>
          <p className="text-xs text-neutral-400">
            Intelligently distributed revision slots based on upcoming mid-terms and course difficulty
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGenerateAISchedule}
            disabled={isGeneratingPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isGeneratingPlan ? 'Optimizing Roadmap...' : 'AI Optimize Schedule'}</span>
          </button>

          <button
            onClick={onOpenNewScheduleModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* AI Plan Banner if generated */}
      {aiPlanOverview && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">AI Academic Advisory Strategy</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{aiPlanOverview}</p>
            </div>
          </div>
          <button
            onClick={() => setAiPlanOverview(null)}
            className="text-xs text-neutral-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
        {daysOfWeek.map(d => {
          const isSelected = selectedDay === d;
          const dayItems = schedule.filter(s => s.day === d);
          const completedDayItems = dayItems.filter(s => s.completed).length;

          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-semibold transition text-center flex flex-col items-center ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <span>{d}</span>
              <span className="text-[10px] font-normal opacity-75 mt-0.5">
                {completedDayItems}/{dayItems.length} Done
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items for Selected Day */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto text-neutral-600" />
            <div className="text-sm font-bold text-white">No study blocks planned for {selectedDay}</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add a focused study session or click &ldquo;AI Optimize Schedule&rdquo; to fill your week automatically.
            </p>
          </div>
        ) : (
          filteredSchedule.map(item => {
            const sub = subjects.find(s => s.id === item.subjectId);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.completed
                    ? 'bg-neutral-900/40 border-neutral-850 opacity-60'
                    : 'bg-neutral-900 hover:bg-neutral-850/80 border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleScheduleItem(item.id)}
                    className="mt-1 text-neutral-500 hover:text-emerald-400 transition flex-shrink-0"
                    title={item.completed ? 'Mark uncompleted' : 'Mark completed (+45m study logged)'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {item.timeBlock}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: sub?.color || '#6366F1' }}
                      >
                        {sub?.code || 'CS'}
                      </span>
                      <span className="text-xs font-bold text-white">{sub?.name}</span>
                    </div>

                    <h4 className="text-xs font-medium text-neutral-200">
                      Focus: <strong className="text-white">{item.focusTopic}</strong>
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-0.5">
                      <span>Method: <strong className="text-neutral-300">{item.sessionType}</strong></span>
                      <span>•</span>
                      <span>Difficulty: <strong className="text-neutral-300">{item.difficulty}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  {!item.completed && (
                    <button
                      onClick={onOpenPomodoro}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Sprint</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteScheduleItem(item.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition"
                    title="Delete slot"
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
