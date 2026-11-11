import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bookmark,
  Award,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  Check
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { ExplanationDifficulty, QuizQuestion } from '../../types';

export const QuizGeneratorView: React.FC = () => {
  const {
    currentQuiz,
    quizAttempts,
    isGeneratingQuiz,
    generateQuiz,
    recordQuizAttempt,
    saveCurrentQuiz,
    showToast
  } = useStudy();

  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<ExplanationDifficulty>('Intermediate');
  const [count, setCount] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mcq', 'tf', 'short']);

  // Active quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const sampleTopics = [
    'Prompting & LLMs',
    'Database Normalization',
    'OSI 7 Layers',
    'Binary Search Trees',
    'AI Hallucinations'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || isGeneratingQuiz) return;
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    await generateQuiz(topicInput.trim(), difficulty, count, selectedTypes);
  };

  const handleSelectSample = (sample: string) => {
    setTopicInput(sample);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    generateQuiz(sample, difficulty, count, selectedTypes);
  };

  const handleOptionSelect = (qId: string, optIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleShortAnswerChange = (qId: string, val: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    if (!currentQuiz) return { score: 0, total: 0, percentage: 0 };
    let score = 0;
    let total = 0;

    currentQuiz.questions.forEach(q => {
      total += q.points;
      const userAns = userAnswers[q.id];

      if (q.type === 'mcq' || q.type === 'tf') {
        if (userAns === q.correctIndex) {
          score += q.points;
        }
      } else if (q.type === 'short') {
        const text = String(userAns || '').toLowerCase();
        if (text.trim().length > 15) {
          score += q.points;
        }
      }
    });

    const percentage = Math.round((score / (total || 1)) * 100);
    return { score, total, percentage };
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    setIsSubmitted(true);
    const { score, total, percentage } = calculateScore();

    recordQuizAttempt({
      quizId: currentQuiz.id,
      topic: currentQuiz.topic,
      score,
      totalPoints: total,
      percentage,
      answers: userAnswers
    });
  };

  const handleRetry = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    showToast('Quiz reset! Beat your score.', 'info');
  };

  const toggleType = (typeKey: string) => {
    if (selectedTypes.includes(typeKey)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== typeKey));
      }
    } else {
      setSelectedTypes([...selectedTypes, typeKey]);
    }
  };

  const currentQ: QuizQuestion | undefined = currentQuiz?.questions[currentQuestionIndex];
  const { score, total, percentage } = calculateScore();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Adaptive Quiz Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MCQs, True/False, and conceptual Short-Answer questions with automated grading.
          </p>
        </div>

        {currentQuiz && (
          <div className="flex items-center gap-2">
            <button
              onClick={saveCurrentQuiz}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentQuiz.saved ? 'Saved' : 'Save Quiz'}</span>
            </button>
            {isSubmitted && (
              <button
                onClick={handleRetry}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Generator Input Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Enter quiz topic (e.g. LLM Attention, Database Transactions, Dijkstra's Algorithm)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isGeneratingQuiz || !topicInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingQuiz ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Level:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
                {(['Beginner', 'Intermediate', 'Advanced'] as ExplanationDifficulty[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1 text-xs font-semibold rounded-lg transition ${
                      difficulty === lvl
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Count:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
                {[3, 5, 8].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-1 text-xs font-semibold rounded-lg transition ${
                      count === num
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Formats:</span>
              {[
                { id: 'mcq', label: 'MCQs' },
                { id: 'tf', label: 'T/F' },
                { id: 'short', label: 'Short' }
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleType(type.id)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition ${
                    selectedTypes.includes(type.id)
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Suggestions:</span>
          {sampleTopics.map(sample => (
            <button
              key={sample}
              onClick={() => handleSelectSample(sample)}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Main Quiz Area */}
      {isGeneratingQuiz ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Formulating Quiz Questions...
          </h3>
          <p className="text-xs text-slate-400">
            Generating challenging distractors and clear explanation keys.
          </p>
        </div>
      ) : currentQuiz ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Active Question (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Score Banner when Submitted */}
            {isSubmitted && (
              <div
                className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  percentage >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100'
                    : percentage >= 60
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-100'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                    <Award
                      className={`w-5 h-5 ${
                        percentage >= 80 ? 'text-emerald-500' : percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">
                      Score: {score} / {total} points ({percentage}%)
                    </h3>
                    <p className="text-xs opacity-90">
                      {percentage >= 80 ? 'Excellent mastery!' : 'Review question explanations below to solidify concepts.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border shadow-xs hover:bg-slate-50 transition"
                >
                  Retry Quiz
                </button>
              </div>
            )}

            {/* Question Card */}
            {currentQ && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentQ.points} Points
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options */}
                {currentQ.type === 'mcq' || currentQ.type === 'tf' ? (
                  <div className="space-y-2.5">
                    {currentQ.options?.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;
                      const isCorrect = isSubmitted && optIdx === currentQ.correctIndex;
                      const isWrongSelected = isSubmitted && isSelected && optIdx !== currentQ.correctIndex;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : isWrongSelected
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                              : isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          {isWrongSelected && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      disabled={isSubmitted}
                      value={String(userAnswers[currentQ.id] || '')}
                      onChange={e => handleShortAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Type your explanation..."
                      className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                    {isSubmitted && currentQ.sampleAnswer && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          Model Answer:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {currentQ.sampleAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Reveal */}
                {isSubmitted && (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      Why this is correct:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {currentQuiz.questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold transition ${
                          currentQuestionIndex === idx
                            ? 'bg-indigo-600 text-white'
                            : userAnswers[currentQuiz.questions[idx].id] !== undefined
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white transition flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : !isSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={handleRetry}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quiz Summary & Attempt History (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Exam Overview
              </h3>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Topic:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {currentQuiz.topic}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentQuiz.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {Object.keys(userAnswers).length} / {currentQuiz.questions.length} answered
                  </span>
                </div>
              </div>

              {!isSubmitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition disabled:opacity-40"
                >
                  Grade My Exam
                </button>
              )}
            </div>

            {/* Past Attempts */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Past Attempts
                </span>
                <span className="text-slate-400">{quizAttempts.length} Total</span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {quizAttempts.length > 0 ? (
                  quizAttempts.slice(0, 5).map(att => (
                    <div
                      key={att.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-0.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate max-w-[150px]">{att.topic}</span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {att.percentage}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>{att.score}/{att.totalPoints} pts</span>
                        <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No attempts logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ready to Test Your Knowledge
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Input a concept or select a suggestion to generate an adaptive quiz.
          </p>
        </div>
      )}
    </div>
  );
};
