import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  Bookmark,
  HelpCircle,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Code2,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { ExplanationDifficulty, ExplanationStyle } from '../../types';

/**
 * Lightweight inline Markdown + fenced code block renderer so AI responses
 * never display raw `**bold**`, `` `code` ``, or unformatted bullet lists.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[11px] font-mono text-indigo-700 dark:text-indigo-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function renderFormattedMessage(rawText: string, isUser: boolean): React.ReactNode {
  const text = (rawText || '').trim();
  if (!text) return null;

  if (isUser) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const inner = block.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre
              key={bIdx}
              className="p-2.5 rounded-xl bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto border border-slate-800"
            >
              <code>{inner}</code>
            </pre>
          );
        }

        const lines = block.split('\n').filter((line, i, arr) => {
          if (line.trim() !== '') return true;
          return i > 0 && arr[i - 1].trim() !== '';
        });

        return (
          <div key={bIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                    <span className="text-blue-500 font-bold leading-relaxed">•</span>
                    <span className="leading-relaxed">{renderInlineMarkdown(bulletMatch[1])}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+[.)])\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400 leading-relaxed shrink-0">
                      {numMatch[1]}
                    </span>
                    <span className="leading-relaxed">{renderInlineMarkdown(numMatch[2])}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInlineMarkdown(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const AITutorView: React.FC = () => {
  const {
    currentExplanation,
    tutorChatHistory,
    isExplaining,
    isChatting,
    explainError,
    chatError,
    clearExplainError,
    clearChatError,
    retryLastExplanation,
    retryLastTutorMessage,
    generateExplanation,
    sendTutorMessage,
    saveCurrentExplanation,
    setActivePage,
    generateQuiz,
    showToast
  } = useStudy();

  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<ExplanationDifficulty>('Intermediate');
  const [style, setStyle] = useState<ExplanationStyle>('Analogy-Rich');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorChatHistory, isChatting, chatError]);

  const sampleTopics = [
    'Attention in Transformers',
    'Process Deadlocks',
    'Bayes’ Theorem',
    'TCP Three-Way Handshake',
    'Matrix Factorization'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || isExplaining) return;
    await generateExplanation(topicInput.trim(), difficulty, style);
  };

  const handleSelectSample = (sample: string) => {
    if (isExplaining) return;
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

  const handleQuickPrompt = (promptText: string) => {
    if (isChatting) return;
    void sendTutorMessage(promptText);
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentExplanation.saved ? 'Saved' : 'Bookmark'}</span>
            </button>
            <button
              onClick={handleLaunchQuiz}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
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
              placeholder="Enter any topic (e.g., Process Deadlocks, TCP Three-Way Handshake, Bayes' Theorem)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isExplaining || !topicInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                    className={`py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
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
              type="button"
              disabled={isExplaining}
              onClick={() => handleSelectSample(sample)}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 transition disabled:opacity-50 cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Explicit Error Banner with Retry */}
      {explainError && !isExplaining && (
        <div
          role="alert"
          className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">Gemini Explanation Request Failed</div>
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed">{explainError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={retryLastExplanation}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={clearExplainError}
              className="px-2.5 py-1.5 rounded-xl font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      {isExplaining ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Generating Fresh Gemini Explanation...
          </h3>
          <p className="text-xs text-slate-400">
            Formulating analogies, step-by-step mechanics, key concepts, and practical examples.
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
              {currentExplanation.introduction && (
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {renderFormattedMessage(currentExplanation.introduction, false)}
                </div>
              )}

              {/* Analogy Callout Box */}
              {currentExplanation.analogy && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>The Real-World Analogy</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{currentExplanation.analogy}&rdquo;
                  </p>
                </div>
              )}

              {/* Core Mechanics List */}
              {Array.isArray(currentExplanation.coreMechanics) && currentExplanation.coreMechanics.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Step-by-Step Mechanics
                  </h4>
                  <div className="space-y-2">
                    {currentExplanation.coreMechanics.map((mech, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                          {renderInlineMarkdown(mech)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Concepts */}
              {Array.isArray(currentExplanation.importantConcepts) && currentExplanation.importantConcepts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Important Concepts</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {currentExplanation.importantConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                      >
                        {renderInlineMarkdown(concept)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Example */}
              {currentExplanation.practicalExample && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                    Practical Example in Action
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {renderFormattedMessage(currentExplanation.practicalExample, false)}
                  </div>
                </div>
              )}

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
                      className="px-2 py-0.5 rounded-md text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
                    <code>{currentExplanation.codeOrFormula}</code>
                  </pre>
                </div>
              )}

              {/* Common Misconceptions */}
              {Array.isArray(currentExplanation.commonMisconceptions) && currentExplanation.commonMisconceptions.length > 0 && (
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
                        <span>{renderInlineMarkdown(misc)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Takeaway */}
              {currentExplanation.summary && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Key Takeaway</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {renderInlineMarkdown(currentExplanation.summary)}
                  </p>
                </div>
              )}

              {/* Trust Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {currentExplanation.modelUsed ? `Gemini (${currentExplanation.modelUsed})` : 'AI Study Synthesizer'} • Cross-verify key formulas
                  </span>
                </span>
                <button
                  onClick={handleLaunchQuiz}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Generate Quiz &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Follow-up Chat (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Follow-up AI Tutor
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      Context: {currentExplanation.topic} ({currentExplanation.difficulty})
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isChatting ? 'Typing...' : 'Ready'}
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {tutorChatHistory
                  .filter(m => m && typeof m.text === 'string' && m.text.trim().length > 0)
                  .map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        {renderFormattedMessage(msg.text, msg.role === 'user')}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {msg.role === 'user' ? 'You' : 'ApnaBhai Tutor'} · {msg.timestamp}
                      </span>
                    </div>
                  ))}

                {isChatting && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                {chatError && !isChatting && (
                  <div
                    role="alert"
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">{chatError}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={retryLastTutorMessage}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearChatError}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1.5 flex flex-wrap gap-1 border-t border-slate-100 dark:border-slate-800">
                {[
                  'Clarify more',
                  'Simplify step 2',
                  'Give another analogy',
                  'Explain with a practical example'
                ].map(p => (
                  <button
                    key={p}
                    type="button"
                    disabled={isChatting}
                    onClick={() => handleQuickPrompt(p)}
                    className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition disabled:opacity-50 cursor-pointer"
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
                  disabled={isChatting}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatting}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition cursor-pointer"
                  aria-label="Send follow-up question"
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
