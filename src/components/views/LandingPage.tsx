import React, { useState } from 'react';
import {
  Brain,
  HelpCircle,
  BookOpen,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  RotateCw,
  Terminal,
  Check,
  Orbit,
  Database,
  Network,
  Code2,
  Sparkles,
  Cloud
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { setActivePage, studyStats, savedNotes, savedDecks, quizAttempts } = useStudy();
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

  const subjectEcosystem = [
    {
      title: 'Algorithms & DS',
      sub: 'Graphs, DP & Complexity',
      icon: Code2,
      bg: 'bg-blue-600',
      page: 'ai-tutor' as const
    },
    {
      title: 'Operating Systems',
      sub: 'Threads, Locks & Memory',
      icon: Cpu,
      bg: 'bg-orange-500',
      page: 'ai-tutor' as const
    },
    {
      title: 'Deep Learning',
      sub: 'Transformers & Attention',
      icon: Brain,
      bg: 'bg-pink-500',
      page: 'ai-tutor' as const
    },
    {
      title: 'Database Systems',
      sub: 'ACID, B-Trees & SQL',
      icon: Database,
      bg: 'bg-teal-600',
      page: 'revision-notes' as const
    },
    {
      title: 'Computer Networks',
      sub: 'TCP/IP, Routing & TLS',
      icon: Network,
      bg: 'bg-violet-600',
      page: 'quiz-generator' as const
    },
    {
      title: 'Prompt & LLM Lab',
      sub: 'Zero-Shot & Hallucinations',
      icon: Sparkles,
      bg: 'bg-amber-500',
      page: 'ai-concepts' as const
    },
    {
      title: '3D Neural Lab',
      sub: 'WebGL Knowledge Graph',
      icon: Orbit,
      bg: 'bg-cyan-600',
      page: '3d-lab' as const
    },
    {
      title: 'Cloud Study Library',
      sub: `${savedNotes.length} Notes · ${savedDecks.length} Decks`,
      icon: Cloud,
      bg: 'bg-zinc-950',
      page: 'study-library' as const
    }
  ];

  return (
    <div className="space-y-28 sm:space-y-32 pb-16 animate-in fade-in duration-300">
      {/* 1. HERO SECTION: Bold Editorial Left + Vibrant Organic Blob & Live Mockup Right */}
      <section className="pt-8 pb-6 md:pt-14 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Copy & Primary CTA */}
            <div className="lg:col-span-5 space-y-7 text-left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-slate-400">
                ApnaBhai · AI Study Buddy
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.06]">
                Learn Smarter with Your AI Study Buddy.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-slate-300 leading-relaxed font-normal max-w-lg">
                Master dense college lectures with multi-level analogies, adaptive exam quizzes, 3D active recall flashcards, and structured revision notes.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={onGetStarted}
                  className="px-7 py-3.5 rounded-2xl font-bold text-sm bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-transform hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 lift-shadow"
                >
                  <span>Start Studying Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActivePage('ai-concepts')}
                  className="px-5 py-3.5 rounded-2xl font-semibold text-sm text-zinc-700 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Explore AI Concepts</span>
                </button>
              </div>

              {/* Clean Live Workspace Summary (No clutter, typographic separator) */}
              <div className="pt-4 border-t border-zinc-100 dark:border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-zinc-500 dark:text-slate-400 tabular-nums">
                <span>
                  <strong className="text-zinc-950 dark:text-white font-bold">{studyStats.topicsExplored}</strong> topics explored
                </span>
                <span>·</span>
                <span>
                  <strong className="text-zinc-950 dark:text-white font-bold">{studyStats.avgQuizScore}%</strong> avg quiz accuracy
                </span>
                <span>·</span>
                <span>
                  <strong className="text-zinc-950 dark:text-white font-bold">{studyStats.studyStreakDays}-day</strong> streak
                </span>
              </div>
            </div>

            {/* Right: Saturated Abstract Blob Illustration Lifting Live Interactive Mockup */}
            <div className="lg:col-span-7 relative">
              {/* Vibrant Organic & Geometric Blob Artwork */}
              <svg
                viewBox="0 0 640 520"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -inset-6 sm:-inset-10 w-[calc(100%+3rem)] sm:w-[calc(100%+5rem)] h-[calc(100%+3rem)] sm:h-[calc(100%+5rem)] pointer-events-none select-none -z-10 opacity-95 dark:opacity-50"
                aria-hidden="true"
              >
                <path
                  d="M454.5 54.2C522.4 89.4 585.1 151.9 595.7 224.8C606.2 297.6 564.6 380.8 498.4 429.5C432.2 478.2 341.4 492.4 261.2 475.1C181.1 457.8 111.7 409.1 77.4 339.2C43.1 269.3 43.9 178.3 89.1 112.9C134.3 47.5 223.9 7.8 308.6 9.8C393.4 11.8 386.6 19 454.5 54.2Z"
                  fill="#2563EB"
                />
                <circle cx="545" cy="112" r="76" fill="#F97316" />
                <path
                  d="M72 344C72 288.772 116.772 244 172 244C227.228 244 272 288.772 272 344C272 399.228 227.228 444 172 444C116.772 444 72 399.228 72 344Z"
                  fill="#EC4899"
                />
                <rect x="405" y="340" width="165" height="135" rx="48" fill="#0D9488" />
              </svg>

              {/* Floating Interactive Workspace Card */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 lift-shadow overflow-hidden text-left">
                {/* Minimal Window Header & Interactive Sandbox Switcher */}
                <div className="px-4 sm:px-5 py-3.5 bg-zinc-50/90 dark:bg-slate-950 border-b border-zinc-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="ml-2 text-[11px] font-mono text-zinc-400 hidden sm:inline">
                      apnabhai.app/workspace
                    </span>
                  </div>

                  {/* Interactive Tabs */}
                  <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-slate-900 p-1 rounded-xl">
                    {[
                      { id: 'explainer', label: 'Explainer', icon: Brain },
                      { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                      { id: 'flashcard', label: 'Flashcard', icon: Layers },
                      { id: 'prompt', label: 'AI Lab', icon: Terminal }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeHeroTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveHeroTab(tab.id as 'explainer' | 'quiz' | 'flashcard' | 'prompt')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-zinc-950 dark:text-white shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-slate-200'
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
                <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center bg-white dark:bg-slate-900">
                  {/* Tab 1: Explainer */}
                  {activeHeroTab === 'explainer' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Advanced · Deep Learning
                          </div>
                          <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">
                            Self-Attention in Transformers
                          </h3>
                        </div>
                        <div className="flex gap-1 bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => setDemoExplainerMode('analogy')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                              demoExplainerMode === 'analogy'
                                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-xs'
                                : 'text-zinc-500'
                            }`}
                          >
                            Analogy
                          </button>
                          <button
                            onClick={() => setDemoExplainerMode('formula')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                              demoExplainerMode === 'formula'
                                ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-xs'
                                : 'text-zinc-500'
                            }`}
                          >
                            Formula
                          </button>
                        </div>
                      </div>

                      {demoExplainerMode === 'analogy' ? (
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 text-xs sm:text-sm text-zinc-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block">
                            Real-World Metaphor
                          </span>
                          <p>
                            Imagine a crowded lecture hall where everyone talks at once. Rather than listening to every voice equally, your brain filters noise and focuses on whoever says something directly relevant to your question. Self-attention dynamically assigns importance weights to every token relative to all other tokens.
                          </p>
                        </div>
                      ) : (
                        <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto leading-relaxed">
                          <code>{`Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V`}</code>
                        </pre>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-zinc-400 text-[11px]">
                          Structured explanation with follow-up chat
                        </span>
                        <button
                          onClick={() => setActivePage('ai-tutor')}
                          className="text-zinc-950 dark:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                          Live Knowledge Check
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">10 pts</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
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
                              className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                                isCorrect
                                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200'
                                  : isWrong
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                                  : isSelected
                                  ? 'bg-zinc-100 dark:bg-slate-800 border-zinc-900 text-zinc-950 dark:text-white'
                                  : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200/80 dark:border-slate-800 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {demoQuizSubmitted && (
                        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 text-xs font-medium">
                          Correct! Few-shot prompting operates strictly in the prompt context window, eliminating training compute.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: 3D Flashcard */}
                  {activeHeroTab === 'flashcard' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Active Recall Flashcard</span>
                        <button
                          onClick={() => setDemoCardFlipped(!demoCardFlipped)}
                          className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Click card to flip
                        </button>
                      </div>

                      <div
                        onClick={() => setDemoCardFlipped(!demoCardFlipped)}
                        className="p-8 rounded-2xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200/70 dark:border-slate-800 cursor-pointer hover:border-pink-400 transition text-center min-h-[150px] flex flex-col justify-center select-none"
                      >
                        {!demoCardFlipped ? (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-2">
                              Operating Systems
                            </div>
                            <h4 className="text-base font-extrabold text-zinc-950 dark:text-white">
                              What is the fundamental difference between a Semaphore and a Mutex?
                            </h4>
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm text-zinc-700 dark:text-slate-300 leading-relaxed font-medium">
                            A <strong className="text-zinc-950 dark:text-white">Mutex</strong> is a locking mechanism owned by a single thread at a time, whereas a <strong className="text-blue-600 dark:text-blue-400">Semaphore</strong> is a signaling mechanism using an integer counter to regulate access across multiple concurrent resources.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Prompt Sandbox */}
                  {activeHeroTab === 'prompt' && (
                    <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-950 dark:text-white">
                          Prompt Engineering: Naive vs. Engineered
                        </span>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                          Grounded Output
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200/60 dark:border-slate-800 space-y-1.5">
                          <span className="font-bold text-rose-600 text-[11px] uppercase tracking-wider">
                            Naive Prompt
                          </span>
                          <p className="text-zinc-700 dark:text-slate-300">
                            &ldquo;Summarize this biology paper.&rdquo;
                          </p>
                          <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-200/60 dark:border-slate-800">
                            Result: Vague paragraphs, missing key enzymes.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200/60 dark:border-slate-800 space-y-1.5">
                          <span className="font-bold text-teal-600 text-[11px] uppercase tracking-wider">
                            Engineered Prompt
                          </span>
                          <p className="text-zinc-800 dark:text-slate-200 font-mono text-[11px]">
                            Extract 3 key enzymatic pathways as a Markdown table with pH invariants.
                          </p>
                          <p className="text-[11px] text-teal-700 dark:text-teal-400 pt-2 border-t border-zinc-200/60 dark:border-slate-800">
                            Result: Structured, deterministic revision table.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MODULAR FEATURE SHOWCASE BLOCKS (Alternating Text + Saturated Blob Visuals) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-28">
        {/* Showcase Block 01: AI Tutor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              01 · Concept Explainer & AI Tutor
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
              Turn dense B.Tech theory into intuitive clarity.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-slate-300 leading-relaxed">
              Choose Beginner, Intermediate, or Advanced depth alongside analogy-first or formula-driven styles. Ask follow-up questions in real time with multi-turn Gemini guidance.
            </p>
            <button
              onClick={() => setActivePage('ai-tutor')}
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              <span>Open AI Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl p-6 sm:p-10 bg-zinc-50 dark:bg-slate-900/60 overflow-hidden">
              {/* Geometric Blob Background */}
              <svg viewBox="0 0 400 260" fill="none" className="absolute right-0 bottom-0 w-72 h-72 opacity-90 dark:opacity-35 pointer-events-none">
                <circle cx="290" cy="190" r="120" fill="#2563EB" />
                <circle cx="195" cy="95" r="56" fill="#F97316" />
              </svg>

              <div className="relative z-10 rounded-2xl bg-white dark:bg-slate-900 p-6 lift-shadow space-y-4 max-w-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-950 dark:text-white">Multi-Tier Breakdown</div>
                      <div className="text-[11px] text-zinc-500">Analogy · Equations · Common Traps</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 tabular-nums">{studyStats.topicsExplored} explored</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-slate-300 bg-zinc-50 dark:bg-slate-950 p-4 rounded-xl">
                  <div className="font-bold text-zinc-950 dark:text-white">Banker’s Algorithm Safety Check</div>
                  <p>
                    Just as a conservative lender checks whether a remaining vault reserve can still satisfy every borrower’s maximum credit line before approving a loan, the OS simulates resource allocation to prevent deadlock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Block 02: Adaptive Quiz Generator (Reversed Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 lg:order-1 order-2 relative">
            <div className="relative rounded-3xl p-6 sm:p-10 bg-zinc-50 dark:bg-slate-900/60 overflow-hidden">
              <svg viewBox="0 0 400 260" fill="none" className="absolute left-0 top-0 w-72 h-72 opacity-90 dark:opacity-35 pointer-events-none">
                <rect x="-30" y="-20" width="210" height="210" rx="84" fill="#EC4899" />
                <circle cx="195" cy="180" r="64" fill="#FACC15" />
              </svg>

              <div className="relative z-10 rounded-2xl bg-white dark:bg-slate-900 p-6 lift-shadow space-y-4 max-w-lg ml-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-950 dark:text-white">Adaptive Exam Engine</div>
                      <div className="text-[11px] text-zinc-500">MCQs · True/False · Short Answer</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-600 tabular-nums">{studyStats.avgQuizScore}% avg</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-slate-950">
                    <div className="text-[11px] text-zinc-500">Quizzes Completed</div>
                    <div className="text-2xl font-extrabold text-zinc-950 dark:text-white tabular-nums mt-0.5">
                      {studyStats.quizzesCompleted}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-slate-950">
                    <div className="text-[11px] text-zinc-500">Recent Attempts</div>
                    <div className="text-2xl font-extrabold text-zinc-950 dark:text-white tabular-nums mt-0.5">
                      {quizAttempts.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:order-2 order-1 space-y-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">
              02 · Adaptive Quiz Generator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
              Test weak spots before exam day arrives.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-slate-300 leading-relaxed">
              Generate custom MCQs, True/False, and conceptual Short-Answer questions tuned to any difficulty. Get instant grading, detailed rationales, and persistent attempt analytics.
            </p>
            <button
              onClick={() => setActivePage('quiz-generator')}
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition cursor-pointer"
            >
              <span>Generate Practice Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Showcase Block 03: Revision Notes & 3D Flashcards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              03 · Revision Notes & 3D Flashcards
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
              Editable cheatsheets paired with active recall.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-slate-300 leading-relaxed">
              Turn any syllabus topic into structured revision notes with inline editing and Markdown export, plus interactive 3D flip flashcards that track known vs. review cards.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={() => setActivePage('revision-notes')}
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Revision Notes</span>
              </button>
              <button
                onClick={() => setActivePage('flashcards')}
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-orange-500" />
                <span>Flashcards</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl p-6 sm:p-10 bg-zinc-50 dark:bg-slate-900/60 overflow-hidden">
              <svg viewBox="0 0 400 260" fill="none" className="absolute right-0 top-0 w-72 h-72 opacity-90 dark:opacity-35 pointer-events-none">
                <circle cx="310" cy="70" r="110" fill="#0D9488" />
                <rect x="200" y="150" width="140" height="140" rx="44" fill="#F97316" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 lift-shadow space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-zinc-950 dark:text-white">Saved Notes</div>
                  <div className="text-2xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
                    {savedNotes.length}
                  </div>
                  <p className="text-[11px] text-zinc-500">Editable sheets · .md download ready</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 lift-shadow space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-zinc-950 dark:text-white">Cards Mastered</div>
                  <div className="text-2xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
                    {studyStats.flashcardsMastered}
                  </div>
                  <p className="text-[11px] text-zinc-500">{savedDecks.length} decks synced in cloud</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY / SUBJECTS & STACK ICON GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-slate-400">
            Curriculum & Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Built across core engineering subjects & AI foundations.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {subjectEcosystem.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setActivePage(item.page)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-600 lift-shadow text-left transition-transform hover:-translate-y-0.5 space-y-3 cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} text-white flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. MINIMAL FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">
            Everything you need to know about AI Tutor, quizzes, Core AI concepts, and exports.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-slate-800 border-y border-zinc-100 dark:border-slate-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-zinc-950 dark:text-white cursor-pointer py-1"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-zinc-950 dark:text-white shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. HIGH-CONTRAST DARK CTA BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 bg-zinc-950 text-white text-center space-y-6">
          {/* Vibrant Accent Shapes on Dark Surface */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-blue-600/35 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-pink-600/35 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to study with razor-sharp focus?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto">
              Open your ApnaBhai workspace to generate explanations, adaptive quizzes, revision sheets, and 3D active recall decks.
            </p>
            <div className="pt-2">
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-white text-zinc-950 hover:bg-zinc-200 transition-transform hover:scale-[1.03] inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch ApnaBhai Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
