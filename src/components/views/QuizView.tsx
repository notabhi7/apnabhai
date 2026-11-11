import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  Award,
  Zap,
  BookOpen,
  Check,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { QuizQuestion } from '../../types';

export const QuizView: React.FC = () => {
  const { subjects, requestQuiz, recordQuizScore, setActiveTab } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'sub-dsa');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'gate_exam_hard'>('medium');
  const [topic, setTopic] = useState('Data Structures & Algorithms Exam Revision');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'In Data Structures, what is the worst-case time complexity of QuickSort when the pivot is always chosen as the minimum element of an already sorted array?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      correctIndex: 1,
      explanation: 'When the pivot is the extreme element (minimum or maximum) of a sorted array, the partitioning creates subproblems of size 0 and n-1 at each step, yielding the recurrence T(n) = T(n-1) + O(n) which evaluates to O(n²).',
      topicTag: 'Sorting Algorithms',
      difficulty: 'medium'
    },
    {
      id: 'q2',
      question: 'Which of the following Page Replacement algorithms in Operating Systems strictly suffers from Belady\'s Anomaly?',
      options: ['Least Recently Used (LRU)', 'Optimal Page Replacement (OPT)', 'First-In, First-Out (FIFO)', 'Least Frequently Used (LFU)'],
      correctIndex: 2,
      explanation: 'Belady\'s Anomaly is the phenomenon where adding more page frames leads to more page faults. FIFO exhibits this because it is not a stack algorithm; LRU and OPT are stack algorithms and never experience Belady\'s anomaly.',
      topicTag: 'Virtual Memory',
      difficulty: 'easy'
    },
    {
      id: 'q3',
      question: 'In relational database theory, if relation R(A, B, C, D) has candidate key {A, B} and functional dependency B -> C exists, which is the highest normal form satisfied by R?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctIndex: 0,
      explanation: 'Because B is a proper subset of candidate key {A, B}, the FD B -> C represents a Partial Dependency of non-prime attribute C on candidate key {A, B}. Hence, R violates 2NF and is only in 1NF.',
      topicTag: 'Normalization',
      difficulty: 'medium'
    },
    {
      id: 'q4',
      question: 'In Computer Networks, what is the minimum number of sequence number bits required for Selective Repeat protocol with sender window size W_s = N and receiver window size W_r = N?',
      options: ['⌈log₂(N)⌉', '⌈log₂(N + 1)⌉', '⌈log₂(2N)⌉', '2N'],
      correctIndex: 2,
      explanation: 'To prevent ambiguity between fresh frames and duplicate retransmitted frames in Selective Repeat, the sequence space size must satisfy Max_Seq_Numbers >= W_s + W_r = 2N. Hence, bits k = ⌈log₂(2N)⌉.',
      topicTag: 'Sliding Window',
      difficulty: 'gate_exam_hard'
    },
    {
      id: 'q5',
      question: 'What happens when a process invokes the wait() system call on a Counting Semaphore initialized to 0?',
      options: ['The semaphore counter becomes 1', 'The process increments the semaphore and continues', 'The process is blocked (placed in the semaphore waiting queue)', 'The operating system terminates with a segmentation fault'],
      correctIndex: 2,
      explanation: 'The wait() (or P()) operation checks if S <= 0. If true, the calling process blocks and is suspended onto the semaphore wait queue until another process executes signal() (or V()).',
      topicTag: 'Process Synchronization',
      difficulty: 'medium'
    }
  ]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const currentQ = questions[currentQIndex];

  // Start new quiz generation
  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    const sub = subjects.find(s => s.id === selectedSubjectId);
    try {
      const generated = await requestQuiz(sub?.name || 'Computer Science', topic, '', difficulty);
      if (generated && generated.length > 0) {
        setQuestions(generated);
        setCurrentQIndex(0);
        setSelectedAnswers({});
        setQuizFinished(false);
        setTimerSeconds(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQIndex] !== undefined) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Finish quiz
      setQuizFinished(true);
      const score = Object.entries(selectedAnswers).filter(
        ([qIdx, ans]) => questions[Number(qIdx)].correctIndex === ans
      ).length;

      recordQuizScore({
        subjectId: selectedSubjectId,
        topic,
        score,
        totalQuestions: questions.length,
        timeSpentSeconds: timerSeconds || 120
      });

      if (score / questions.length >= 0.8) {
        confetti({ particleCount: 70, spread: 80 });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setQuizFinished(false);
  };

  // Score calculation
  const totalCorrect = Object.entries(selectedAnswers).filter(
    ([qIdx, ans]) => questions[Number(qIdx)].correctIndex === ans
  ).length;

  const scorePercentage = Math.round((totalCorrect / questions.length) * 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            University & GATE Engineering Quiz Arena
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time interactive quizzes with instant code analysis, correctness checking, and explanations
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-studio')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate from Lecture Notes</span>
        </button>
      </div>

      {/* Quiz Generator Ribbon */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Focus Topic / Module..."
            className="flex-1 min-w-[200px] px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
          />

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as any)}
            className="px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="easy">Easy (Definitions)</option>
            <option value="medium">Medium (Semester Level)</option>
            <option value="gate_exam_hard">GATE Hard (Corner Cases)</option>
          </select>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Drafting Questions...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Generate 5 Questions</span>
            </>
          )}
        </button>
      </div>

      {/* Main Quiz Area */}
      {!quizFinished ? (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Progress bar and counter */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">
              Question {currentQIndex + 1} of {questions.length}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-indigo-300">
              {currentQ.difficulty.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {currentQ.topicTag || 'Core Engineering'}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQIndex] === idx;
                const hasAnswered = selectedAnswers[currentQIndex] !== undefined;
                const isCorrect = idx === currentQ.correctIndex;

                let cardStyles = 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:border-neutral-700';
                if (hasAnswered) {
                  if (isCorrect) {
                    cardStyles = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    cardStyles = 'bg-rose-950/40 border-rose-500/60 text-rose-200';
                  } else {
                    cardStyles = 'bg-neutral-950/40 border-neutral-850 text-neutral-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm transition flex items-center justify-between gap-3 ${cardStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800/80 flex items-center justify-center text-xs font-mono font-bold text-neutral-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answering */}
            {selectedAnswers[currentQIndex] !== undefined && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 space-y-1.5 animate-in fade-in">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Concept Explanation:
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next / Submit button */}
            <div className="flex items-center justify-end pt-4 border-t border-neutral-800">
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQIndex] === undefined}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-40"
              >
                <span>{currentQIndex === questions.length - 1 ? 'Finish & Score' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Award className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white">Quiz Completed!</h3>
            <p className="text-xs text-neutral-400">
              Subject: {subjects.find(s => s.id === selectedSubjectId)?.name}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-400">Score Achieved</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {totalCorrect} / {questions.length}
              </div>
            </div>

            <div>
              <div className="text-xs text-neutral-400">Accuracy Rate</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {scorePercentage}%
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {scorePercentage >= 80
              ? 'Outstanding performance! You have grasped the foundational invariants and tricky corner cases for this module.'
              : scorePercentage >= 60
              ? 'Good effort! Review the flashcards and lecture notes for the questions you missed to solidify concepts.'
              : 'Keep practicing! Review the detailed explanations and use the AI conceptual tutor to clarify difficult spots.'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetQuiz}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>

            <button
              onClick={handleGenerateQuiz}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Generate New Questions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
