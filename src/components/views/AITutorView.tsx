import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  Bookmark,
  HelpCircle,
  Layers,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Code2,
  RefreshCw,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { ExplanationDifficulty, ExplanationStyle } from '../../types';

export const AITutorView: React.FC = () => {
  const {
    currentExplanation,
    tutorChatHistory,
    isExplaining,
    isChatting,
    generateExplanation,
    sendTutorMessage,
    saveCurrentExplanation,
    setActivePage,
    generateQuiz,
    generateFlashcards,
    showToast
  } = useStudy();

  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<ExplanationDifficulty>('Intermediate');
  const [style, setStyle] = useState<ExplanationStyle>('Analogy-Rich');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleTopics = [
    'Attention in Transformers',
    'Process Deadlocks',
    'Bayes’ Theorem',
    'TCP Three-Way Handshake',
    'Master Theorem'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || isExplaining) return;
    await generateExplanation(topicInput.trim(), difficulty, style);
  };

  const handleSelectSample = (sample: string) => {
    setTopicInput(sample);
    generateExplanation(sample, difficulty, style);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const msg = chatInput.trim();
    setChatInput('');
    await sendTutorMessage(msg);
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLaunchQuiz = () => {
    if (currentExplanation) {
      generateQuiz(currentExplanation.topic, currentExplanation.difficulty);
      setActivePage('quiz-generator');
    }
  };

  const handleLaunchFlashcards = () => {
    if (currentExplanation) {
      generateFlashcards(currentExplanation.topic, 6, currentExplanation.difficulty);
      setActivePage('flashcards');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span>AI Concept Explainer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Concept Explainer & Tutor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-tiered analogies, mechanics, formulas, and continuous follow-up dialogue.
          </p>
        </div>

        {currentExplanation && (
          <div className="flex items-center gap-2">
            <button
              onClick={saveCurrentExplanation}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentExplanation.saved ? 'Saved' : 'Bookmark'}</span>
            </button>
            <button
              onClick={handleLaunchQuiz}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Test Concept</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Config Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Enter any topic (e.g., Attention Mechanism, Semaphore vs Mutex, Bayes' Rule)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isExplaining || !topicInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isExplaining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Style:</span>
              <select
                value={style}
                onChange={e => setStyle(e.target.value as ExplanationStyle)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Analogy-Rich">Analogy-Rich (Intuitive Metaphors)</option>
                <option value="Technical & Formal">Technical & Formal (Rigorous)</option>
                <option value="Socratic & Conceptual">Socratic & Conceptual (First-Principles)</option>
                <option value="Executive Summary">Executive Summary (High-Yield)</option>
              </select>
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
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      {isExplaining ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Structuring Concept Explanation...
          </h3>
          <p className="text-xs text-slate-400">
            Formulating analogies, step-by-step mechanics, and common misconceptions.
          </p>
        </div>
      ) : currentExplanation ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Structured Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {currentExplanation.difficulty} • {currentExplanation.style}
                  </span>
                  <span className="text-slate-400">
                    {new Date(currentExplanation.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {currentExplanation.title || currentExplanation.topic}
                </h2>
              </div>

              {/* Introduction */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentExplanation.introduction}
              </p>

              {/* Analogy Callout Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>The Real-World Analogy</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{currentExplanation.analogy}&rdquo;
                </p>
              </div>

              {/* Core Mechanics List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Step-by-Step Mechanics
                </h4>
                <div className="space-y-2">
                  {currentExplanation.coreMechanics?.map((mech, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {mech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code or Formula Block */}
              {currentExplanation.codeOrFormula && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-violet-500" />
                      <span>Formula / Code Snippet</span>
                    </span>
                    <button
                      onClick={() => handleCopySnippet(currentExplanation.codeOrFormula || '')}
                      className="px-2 py-0.5 rounded-md text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                    <code>{currentExplanation.codeOrFormula}</code>
                  </pre>
                </div>
              )}

              {/* Common Misconceptions */}
              {currentExplanation.commonMisconceptions?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common Misconceptions & Traps</span>
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {currentExplanation.commonMisconceptions.map((misc, idx) => (
                      <li
                        key={idx}
                        className="text-slate-700 dark:text-slate-300 bg-rose-50/40 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-200/40 dark:border-rose-900/40 flex items-start gap-2"
                      >
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{misc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Takeaway */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Key Takeaway</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {currentExplanation.summary}
                </p>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI Study Synthesizer • Cross-verify key formulas</span>
                </span>
                <button
                  onClick={handleLaunchQuiz}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Generate Quiz &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Follow-up Chat (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[580px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Follow-up AI Tutor
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Ready
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {tutorChatHistory.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-400 w-16">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1.5 flex flex-wrap gap-1 border-t border-slate-100 dark:border-slate-800">
                {[
                  'Give another analogy',
                  'Simplify step 2',
                  'Show failure case'
                ].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChatInput(p)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Dock */}
              <form onSubmit={handleChatSubmit} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a clarifying question..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatting}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ready to Understand Any Topic
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Input a concept above or pick a suggestion to receive an analogy-backed breakdown.
          </p>
        </div>
      )}
    </div>
  );
};
