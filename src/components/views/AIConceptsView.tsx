import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Brain,
  Terminal,
  Play,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { aiConceptLessons } from '../../data/aiConceptData';
import { AIConceptLesson } from '../../types';
import { useStudy } from '../../context/StudyContext';

export const AIConceptsView: React.FC = () => {
  const { showToast } = useStudy();
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);

  const activeLesson: AIConceptLesson = aiConceptLessons[selectedConceptIndex];
  const [promptText, setPromptText] = useState(activeLesson.interactivePrompt.initialPrompt);
  const [inputText, setInputText] = useState(activeLesson.interactivePrompt.taskInput);
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Quiz Challenge
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSelectLesson = (idx: number) => {
    setSelectedConceptIndex(idx);
    const newLesson = aiConceptLessons[idx];
    setPromptText(newLesson.interactivePrompt.initialPrompt);
    setInputText(newLesson.interactivePrompt.taskInput);
    setPlaygroundOutput(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleRunPlayground = async () => {
    setIsRunningTest(true);
    setPlaygroundOutput(null);
    try {
      const res = await fetch('/api/ai/ai-concept-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptType: activeLesson.slug,
          concept: activeLesson.slug,
          userPrompt: promptText,
          prompt: promptText,
          taskInput: inputText,
          input: inputText
        })
      });
      const data = await res.json();
      setPlaygroundOutput(data.output || activeLesson.interactivePrompt.sampleOutput);
      showToast('Sandbox executed!', 'success');
    } catch (e) {
      setPlaygroundOutput(activeLesson.interactivePrompt.sampleOutput);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    setQuizSubmitted(true);
    if (selectedOption === activeLesson.quizChallenge.correctIndex) {
      showToast('Correct answer!', 'success');
    } else {
      showToast('Incorrect. Check explanation below.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 mb-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>Foundational AI Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Core AI Concepts Curriculum
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Master prompting directives, LLM token prediction, zero-shot vs few-shot learning, and hallucination mitigation.
        </p>
      </div>

      {/* 5 Concept Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {aiConceptLessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => handleSelectLesson(idx)}
            className={`p-2.5 rounded-xl text-left transition ${
              selectedConceptIndex === idx
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
          >
            <div className="text-[10px] font-mono text-slate-400">
              0{idx + 1}
            </div>
            <div className="text-xs truncate">{lesson.title.split('&')[0]}</div>
          </button>
        ))}
      </div>

      {/* Lesson Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Theory & Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Module 0{selectedConceptIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {activeLesson.title}
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mt-0.5">
                {activeLesson.tagline}
              </p>
            </div>

            {/* Core Definition Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>Technical Definition</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                {activeLesson.coreDefinition}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeLesson.description}
            </p>

            {/* Real World Scenario */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Real-World Scenario
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeLesson.realWorldExample}
              </p>
            </div>

            {/* Comparison Table */}
            {activeLesson.comparisonTable && (
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Comparative Analysis
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">Dimension</th>
                        <th className="p-2.5">Baseline</th>
                        <th className="p-2.5">Engineered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeLesson.comparisonTable.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                            {row.feature}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {row.colA}
                          </td>
                          <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-medium">
                            {row.colB}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Sandbox & Challenge (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Sandbox */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Interactive Sandbox</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Active Test
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Prompt Directive
                </label>
                <textarea
                  rows={2}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Input Payload
                </label>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleRunPlayground}
                disabled={isRunningTest}
                className="w-full py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isRunningTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Execute Sandbox</span>
                  </>
                )}
              </button>

              {playgroundOutput && (
                <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 space-y-1.5 border border-slate-800 animate-in fade-in">
                  <div className="text-[10px] text-slate-400 font-mono">OUTPUT</div>
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-100">
                    {playgroundOutput}
                  </pre>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    💡 {activeLesson.interactivePrompt.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Knowledge Challenge */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <HelpCircle className="w-3.5 h-3.5 text-violet-500" />
              <span>Concept Check</span>
            </div>

            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {activeLesson.quizChallenge.question}
            </p>

            <div className="space-y-1.5">
              {activeLesson.quizChallenge.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = quizSubmitted && i === activeLesson.quizChallenge.correctIndex;
                const isWrong = quizSubmitted && isSelected && i !== activeLesson.quizChallenge.correctIndex;

                return (
                  <button
                    key={i}
                    disabled={quizSubmitted}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-start gap-2 ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : isWrong
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                        : isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={selectedOption === null}
                className="w-full py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-40"
              >
                Check Answer
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeLesson.quizChallenge.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
