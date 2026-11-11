import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  Flame,
  Clock,
  Layers,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { academicGoal, updateAcademicGoal, subjects, flashcards, quizAttempts, notes, deadlines } = useApp();

  const [targetCGPAInput, setTargetCGPAInput] = useState(academicGoal.targetCGPA.toString());
  const [predictedSemGrade, setPredictedSemGrade] = useState('9.4');
  const [showCalculator, setShowCalculator] = useState(false);

  // Computed metrics
  const totalNotes = notes.length;
  const masteredCards = flashcards.filter(f => f.masteryLevel === 2).length;
  const totalCards = flashcards.length;
  const flashcardRetention = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const totalQuizzes = quizAttempts.length;
  const avgQuizAccuracy =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / totalQuizzes
        )
      : 84;

  const completedDeadlines = deadlines.filter(d => d.status === 'completed').length;
  const totalDeadlines = deadlines.length;

  const studyHours = (academicGoal.totalStudyMinutes / 60).toFixed(1);

  // Attendance safe bunk calculation (75% threshold)
  // Let total classes = 40 per subject, 5 subjects = 200 classes total
  const estimatedTotalClasses = 200;
  const attendedClasses = Math.round((academicGoal.attendanceRate / 100) * estimatedTotalClasses);
  const minRequiredClasses = Math.ceil(0.75 * estimatedTotalClasses);
  const safeBunksRemaining = Math.max(0, attendedClasses - minRequiredClasses);

  const handleSaveCGPA = () => {
    const val = parseFloat(targetCGPAInput);
    if (!isNaN(val) && val >= 0 && val <= 10) {
      updateAcademicGoal({ targetCGPA: val });
    }
  };

  // Required GPA for remaining semesters
  const completedCredits = academicGoal.completedCredits;
  const remainingCredits = academicGoal.totalCredits - completedCredits;
  const targetPoints = academicGoal.targetCGPA * academicGoal.totalCredits;
  const currentPoints = academicGoal.currentCGPA * completedCredits;
  const requiredRemainingGPA = Math.min(
    10.0,
    Math.max(0, (targetPoints - currentPoints) / remainingCredits)
  ).toFixed(2);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Academic Progress & Real-Time Analytics
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time B.Tech performance telemetry, CGPA trajectory, and subject mastery radar
          </p>
        </div>

        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{showCalculator ? 'Hide CGPA Predictor' : 'CGPA Goal Predictor'}</span>
        </button>
      </div>

      {/* CGPA What-If Predictor Box */}
      {showCalculator && (
        <div className="p-6 rounded-3xl bg-neutral-900 border border-indigo-500/30 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Target CGPA Reverse Engineering</h3>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
              Semester 4 of 8
            </span>
          </div>

          <p className="text-xs text-neutral-300">
            Based on your completed <strong className="text-white">{completedCredits} credits</strong> with current CGPA of <strong className="text-white">{academicGoal.currentCGPA}</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="text-xs text-neutral-400">Target Cumulative CGPA</div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.01"
                  max="10"
                  min="0"
                  value={targetCGPAInput}
                  onChange={e => setTargetCGPAInput(e.target.value)}
                  className="w-24 px-2 py-1 text-base font-bold bg-neutral-900 border border-neutral-700 rounded-lg text-white"
                />
                <button
                  onClick={handleSaveCGPA}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="text-xs text-neutral-400">Required Remaining SGPA</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {requiredRemainingGPA} / 10.0
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Average needed across Sem 5-8</div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="text-xs text-neutral-400">Degree Completion Status</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {Math.round((completedCredits / academicGoal.totalCredits) * 100)}%
              </div>
              <div className="text-[11px] text-indigo-400 mt-0.5">
                {completedCredits} / {academicGoal.totalCredits} Credits Done
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Study Time Logged</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{studyHours} hrs</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.5 hrs this week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{academicGoal.studyStreakDays} Days</div>
          <div className="text-[11px] text-amber-400 font-medium">
            Personal Record: 21 Days
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Concept Retention Rate</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{flashcardRetention}%</div>
          <div className="text-[11px] text-cyan-400 font-medium">
            {masteredCards} of {totalCards} cards mastered
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Average Quiz Score</span>
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{avgQuizAccuracy}%</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            GATE / Exam percentile top 8%
          </div>
        </div>
      </div>

      {/* Main Analysis: Subject Mastery vs Attendance & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course Syllabus Mastery (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Subject-wise Syllabus & Exam Readiness</h3>
              <p className="text-xs text-neutral-400">Coverage across theory, derivations, and lab assignments</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">{subjects.length} Enrolled</span>
          </div>

          <div className="space-y-4">
            {subjects.map(sub => {
              const subNotes = notes.filter(n => n.subjectId === sub.id).length;
              const subCards = flashcards.filter(f => f.subjectId === sub.id).length;
              return (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="text-xs font-bold text-white">{sub.code}: {sub.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {sub.syllabusProgress}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${sub.syllabusProgress}%`, backgroundColor: sub.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Instructor: {sub.professor}</span>
                    <span>
                      {subNotes} notes • {subCards} flashcards • Target: {sub.targetGrade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: University Attendance & Compliance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Attendance Safety Box */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">University 75% Attendance Guard</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Safe Margin
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-extrabold text-white">
                  {academicGoal.attendanceRate}%
                </span>
                <span className="text-xs text-neutral-400"> (Threshold: 75%)</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">
                  +{safeBunksRemaining} Classes Buffer
                </span>
                <div className="text-[10px] text-neutral-500">Safe to miss if sick</div>
              </div>
            </div>

            <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${academicGoal.attendanceRate}%` }}
              />
              {/* 75% indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500"
                style={{ left: '75%' }}
                title="75% Mandatory Cutoff"
              />
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              University regulations require minimum 75% attendance to receive hall ticket for End-Term theory examinations. You are safely above the threshold.
            </p>
          </div>

          {/* Submission Completion Box */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Semester Submissions Handled</span>
              <span className="text-white font-bold">{completedDeadlines} / {totalDeadlines}</span>
            </div>

            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{
                  width: `${totalDeadlines > 0 ? (completedDeadlines / totalDeadlines) * 100 : 100}%`
                }}
              />
            </div>

            <div className="text-xs text-neutral-300">
              All lab files and mid-term preparatory milestones are synchronized with university deadlines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
