import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  HelpCircle,
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  RotateCw,
  Terminal,
  Check
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { setActivePage } = useStudy();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Demo Sandbox State in Hero
  const [activeHeroTab, setActiveHeroTab] = useState<'explainer' | 'quiz' | 'flashcard' | 'prompt'>('explainer');
  const [demoQuizAnswer, setDemoQuizAnswer] = useState<number | null>(null);
  const [demoQuizSubmitted, setDemoQuizSubmitted] = useState(false);
  const [demoCardFlipped, setDemoCardFlipped] = useState(false);
  const [demoExplainerMode, setDemoExplainerMode] = useState<'analogy' | 'formula'>('analogy');

  const faqs = [
    {
      q: 'How does AI Study Buddy explain difficult academic concepts?',
      a: 'It provides multi-tiered breakdowns: intuitive real-world analogies, formal step-by-step mechanics, mathematical equations, and common student misconceptions, backed by interactive follow-up chat.'
    },
    {
      q: 'What question formats are supported in the quiz generator?',
      a: 'Multiple Choice Questions (MCQs), True/False, and conceptual Short-Answer questions with automated grading and instant reasoning reveals.'
    },
    {
      q: 'What is covered in the Core AI Topics curriculum?',
      a: 'A dedicated masterclass covering Prompt Engineering, Large Language Models (LLMs), Zero-Shot vs Few-Shot Learning, and AI Hallucination mitigation with live prompt testing sandboxes.'
    },
    {
      q: 'Can I export or download my study notes?',
      a: 'Yes. Revision notes can be edited in real-time, copied to your clipboard in formatted Markdown, or downloaded directly as .md files for offline study.'
    }
  ];

  return (
    <div className="space-y-24 pb-20 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-12 md:pt-16 md:pb-20 text-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-violet-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>AI-Powered Academic Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Learn Smarter with Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
              AI Study Buddy
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Master dense college lectures with multi-level analogies, adaptive exam quizzes, 3D active recall flashcards, and verified revision notes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Start Studying Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('ai-concepts')}
              className="px-6 py-3 rounded-2xl font-semibold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Explore AI Concepts</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Active Recall Science
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Zero Setup Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Prompting, LLMs & Hallucinations
            </span>
          </div>
        </div>

        {/* 2. INTERACTIVE LIVE PRODUCT MOCKUP SANDBOX */}
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                  ai-study-buddy.app/workspace
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl">
                {[
                  { id: 'explainer', label: 'Concept Explainer', icon: Brain },
                  { id: 'quiz', label: 'Interactive Quiz', icon: HelpCircle },
                  { id: 'flashcard', label: '3D Card', icon: Layers },
                  { id: 'prompt', label: 'AI Sandbox', icon: Terminal }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeHeroTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHeroTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sandbox Tab Content */}
            <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center bg-slate-50/50 dark:bg-slate-950/40">
              {/* Tab 1: Explainer */}
              {activeHeroTab === 'explainer' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Advanced • Deep Learning
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Self-Attention in Transformers
                      </h3>
                    </div>
                    <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setDemoExplainerMode('analogy')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          demoExplainerMode === 'analogy'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Analogy
                      </button>
                      <button
                        onClick={() => setDemoExplainerMode('formula')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          demoExplainerMode === 'formula'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Formula
                      </button>
                    </div>
                  </div>

                  {demoExplainerMode === 'analogy' ? (
                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block">
                        💡 Real-World Metaphor:
                      </span>
                      <p>
                        Imagine a cocktail party where everyone talks at once. Rather than listening to all voices equally, your brain filters noise and selectively focuses on whoever says something directly relevant to your current topic. Self-attention dynamically assigns importance weights to every token relative to all other tokens.
                      </p>
                    </div>
                  ) : (
                    <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                      <code>{`Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V`}</code>
                    </pre>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-400 text-[11px]">
                      ⚡ Instant breakdown generated in 0.8s
                    </span>
                    <button
                      onClick={() => setActivePage('ai-tutor')}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Try full AI Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Quiz */}
              {activeHeroTab === 'quiz' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Live Knowledge Check
                    </span>
                    <span className="text-[11px] text-slate-400">10 Points</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    What primary advantage does Few-Shot prompting have over Fine-Tuning a model?
                  </h4>

                  <div className="space-y-2">
                    {[
                      'It permanently edits the underlying neural network weights',
                      'It provides rapid in-context adaptation without expensive GPU retraining',
                      'It guarantees the model will never hallucinate'
                    ].map((opt, i) => {
                      const isSelected = demoQuizAnswer === i;
                      const isCorrect = demoQuizSubmitted && i === 1;
                      const isWrong = demoQuizSubmitted && isSelected && i !== 1;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setDemoQuizAnswer(i);
                            setDemoQuizSubmitted(true);
                          }}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                              : isWrong
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200'
                              : isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-800 dark:text-indigo-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {demoQuizSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/20">
                      ✓ Correct! Few-shot prompting operates strictly in the prompt context window, eliminating training compute.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: 3D Flashcard */}
              {activeHeroTab === 'flashcard' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active Recall Flashcard</span>
                    <span className="text-[11px] text-blue-500 flex items-center gap-1 cursor-pointer" onClick={() => setDemoCardFlipped(!demoCardFlipped)}>
                      <RotateCw className="w-3.5 h-3.5" />
                      Click card to flip
                    </span>
                  </div>

                  <div
                    onClick={() => setDemoCardFlipped(!demoCardFlipped)}
                    className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg cursor-pointer hover:border-blue-500/40 transition text-center min-h-[140px] flex flex-col justify-center select-none"
                  >
                    {!demoCardFlipped ? (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 mb-2 inline-block">
                          Operating Systems
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          What is the fundamental difference between a Semaphore and a Mutex?
                        </h4>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        A <strong className="text-indigo-600 dark:text-indigo-400">Mutex</strong> is a locking mechanism owned by a single thread at a time, whereas a <strong className="text-blue-600 dark:text-blue-400">Semaphore</strong> is a signaling mechanism using an integer counter to regulate access across multiple concurrent resources.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Prompt Sandbox */}
              {activeHeroTab === 'prompt' && (
                <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Prompt Engineering: Naive vs. Engineered
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Zero Hallucinations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                      <span className="font-bold text-rose-600 text-[11px]">Naive Prompt</span>
                      <p className="text-slate-600 dark:text-slate-400">
                        &ldquo;Summarize this biology paper.&rdquo;
                      </p>
                      <p className="text-[10px] text-rose-500/80 pt-1 border-t border-rose-200/40">
                        Result: Vague paragraphs, missing key enzymes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                      <span className="font-bold text-emerald-600 text-[11px]">Engineered Prompt</span>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        Extract 3 key enzymatic pathways as markdown table with pH invariants.
                      </p>
                      <p className="text-[10px] text-emerald-600 pt-1 border-t border-emerald-200/40">
                        Result: Structured, deterministic, high-yield table.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Academic Excellence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to understand, retain, and test college coursework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div
            onClick={() => setActivePage('ai-tutor')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
              Concept Explainer & Tutor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-tiered breakdowns with intuitive analogies, mathematical formulas, and live interactive follow-up dialogue.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => setActivePage('quiz-generator')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Adaptive Quiz Generator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate MCQs, True/False, and conceptual Short-Answer questions with automated grading and explanations.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => setActivePage('revision-notes')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 transition-all hover:shadow-xl hover:shadow-violet-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition">
              Structured Revision Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curate lecture summaries, definitions, and exam tips. Live inline editing with one-click Markdown downloads.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            onClick={() => setActivePage('flashcards')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
              Active Recall Flashcards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              3D card flip animation with spaced repetition tracking to turn short-term memory into permanent retention.
            </p>
          </div>

          {/* Feature 5 */}
          <div
            onClick={() => setActivePage('ai-concepts')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Core AI Concepts Curriculum
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Master the technology powering your study tools: Prompting, LLMs, Zero-Shot, Few-Shot, and Hallucination mitigation.
            </p>
          </div>

          {/* Feature 6 */}
          <div
            onClick={() => setActivePage('study-library')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 transition-all hover:shadow-xl hover:shadow-violet-500/5 group cursor-pointer space-y-2.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition">
              Personalized Study Library
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Centralized search and organization for your revision notes, quiz scorecards, and flashcard decks across all courses.
            </p>
          </div>
        </div>
      </section>

      {/* 4. STREAMLINED HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Simple 3-Step Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How AI Study Buddy Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Input Any Topic</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter any concept from Distributed Systems to Organic Chemistry.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Your Study Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate intuitive analogies, a practice quiz, revision notes, or flashcards.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Master & Retain</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save materials, track test scores, and solidify understanding before exams.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quick answers to common questions about accuracy and features.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-center space-y-5 shadow-xl shadow-indigo-500/20">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Upgrade Your Academic Performance?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Experience next-level comprehension with AI-powered analogies, adaptive quizzes, and active recall.
          </p>

          <button
            onClick={onGetStarted}
            className="px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-white text-indigo-700 hover:bg-blue-50 shadow-lg transition-transform hover:scale-105"
          >
            Launch AI Study Buddy
          </button>
        </div>
      </section>
    </div>
  );
};
