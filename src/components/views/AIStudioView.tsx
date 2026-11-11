import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  Compass,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Code2,
  Brain,
  MessageSquare,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LectureNote } from '../../types';

export const AIStudioView: React.FC = () => {
  const {
    subjects,
    notes,
    requestSummary,
    requestQuiz,
    requestFlashcards,
    requestResources,
    addFlashcardsBatch,
    setActiveTab,
    selectedSubjectId
  } = useApp();

  const [activeTool, setActiveTool] = useState<'summarize' | 'quiz' | 'flashcards' | 'explain' | 'resources'>('summarize');

  // Form states
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjectId || subjects[0]?.id || 'sub-dsa');
  const [topicName, setTopicName] = useState('Dijkstra and Bellman-Ford Shortest Path');
  const [noteContent, setNoteContent] = useState('');
  const [summaryStyle, setSummaryStyle] = useState('exam_cheatsheet');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [tutorQuestion, setTutorQuestion] = useState('Why does Dijkstra fail with negative edge weights? Explain with a simple graph example.');

  // Loading and result states
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick-load from existing note
  const handleSelectExistingNote = (noteId: string) => {
    const found = notes.find(n => n.id === noteId);
    if (found) {
      setSelectedSubject(found.subjectId);
      setTopicName(found.topic);
      setNoteContent(found.content);
    }
  };

  const handleRunAI = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);

    const subjectObj = subjects.find(s => s.id === selectedSubject);
    const subName = subjectObj?.name || 'Computer Science';

    try {
      if (activeTool === 'summarize') {
        const dummyNote: LectureNote = {
          id: 'temp',
          subjectId: selectedSubject,
          title: topicName,
          topic: topicName,
          moduleNumber: 1,
          content: noteContent || 'Standard B.Tech semester module covering theoretical definitions, invariants, and algorithms.',
          tags: ['AI-Summary'],
          date: new Date().toISOString(),
          bookmarked: false,
          difficulty: 'Medium'
        };
        const res = await requestSummary(dummyNote, summaryStyle);
        setResultData(res);
      } else if (activeTool === 'quiz') {
        const questions = await requestQuiz(subName, topicName, noteContent, quizDifficulty);
        setResultData({ questions });
      } else if (activeTool === 'flashcards') {
        const cards = await requestFlashcards(subName, topicName, noteContent);
        setResultData({ flashcards: cards });
      } else if (activeTool === 'explain') {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: tutorQuestion, subject: subName, context: noteContent })
        });
        const data = await res.json();
        setResultData(data);
      } else if (activeTool === 'resources') {
        const res = await requestResources(subName, topicName);
        setResultData({ resources: res });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneratedFlashcards = () => {
    if (resultData?.flashcards && Array.isArray(resultData.flashcards)) {
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      addFlashcardsBatch(
        resultData.flashcards.map((fc: any) => ({
          subjectId: selectedSubject,
          topic: topicName,
          front: fc.front,
          back: fc.back,
          hint: fc.hint,
          masteryLevel: 0,
          tag: subjectObj?.code || 'CS'
        }))
      );
      setActiveTab('flashcards');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-900 border border-indigo-500/30 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Powered by Gemini 3.8 Flash • Engineering Syllabus Optimized</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            AI Engineering Learning Studio
          </h2>

          <p className="text-xs md:text-sm text-neutral-300">
            Turn bulky lecture notes, complex textbook proofs, and algorithm derivations into high-yield exam summaries, interactive quizzes, active-recall flashcards, and step-by-step conceptual explanations.
          </p>
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800">
        {[
          { id: 'summarize', label: 'Exam Notes Summarizer', icon: BookOpen },
          { id: 'quiz', label: 'University Quiz Generator', icon: HelpCircle },
          { id: 'flashcards', label: 'Flashcard Synthesizer', icon: Layers },
          { id: 'explain', label: 'Conceptual Tutor & Analogy', icon: Brain },
          { id: 'resources', label: 'Curated Resource Finder', icon: Compass }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id as any);
                setResultData(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt / Input Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Configuration & Context
            </h3>

            {/* Quick load from notes */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Autofill from existing Lecture Note (Optional)
              </label>
              <select
                onChange={e => e.target.value && handleSelectExistingNote(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose a lecture note to analyze --</option>
                {notes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Subject / Course *
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic / Question Input */}
            {activeTool === 'explain' ? (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  What engineering concept or question is confusing you? *
                </label>
                <textarea
                  rows={3}
                  value={tutorQuestion}
                  onChange={e => setTutorQuestion(e.target.value)}
                  placeholder="e.g. Why does Belady's Anomaly only occur in FIFO page replacement and never in LRU?"
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Topic / Chapter Title *
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={e => setTopicName(e.target.value)}
                  placeholder="e.g. Memory Management & Paging"
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Tool specific configurations */}
            {activeTool === 'summarize' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Summary Target Style
                </label>
                <select
                  value={summaryStyle}
                  onChange={e => setSummaryStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="exam_cheatsheet">High-Yield Exam Cheatsheet (Formulas & Traps)</option>
                  <option value="comprehensive">Comprehensive Academic Breakdown</option>
                  <option value="key_concepts">Bullet Point Invariants & Definitions</option>
                  <option value="code_walkthrough">Algorithm & Complexity Walkthrough</option>
                </select>
              </div>
            )}

            {activeTool === 'quiz' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={quizDifficulty}
                  onChange={e => setQuizDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="easy">University Foundation (Definitions & Syntax)</option>
                  <option value="medium">Standard Semester Exam (Derivations & Complexity)</option>
                  <option value="gate_exam_hard">GATE / Competitive Hard (Corner Cases & Deep Analysis)</option>
                </select>
              </div>
            )}

            {/* Detailed Notes / Context Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Lecture Notes or Syllabus Content (Optional)
              </label>
              <textarea
                rows={4}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Paste teacher's notes, slides transcript, or textbook paragraph here to ground the generation..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleRunAI}
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>Generate with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl min-h-[460px] flex flex-col justify-between">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs mb-4">
                <strong>Error:</strong> {errorMsg}
              </div>
            )}

            {!resultData && !isLoading && !errorMsg && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                <div className="w-14 h-14 rounded-2xl bg-neutral-850 flex items-center justify-center mb-3 text-indigo-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Studio Canvas Ready</h4>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Select your subject, provide a topic or paste lecture notes on the left, then click Generate to produce university-grade study aids.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                    <Sparkles className="w-6 h-6 text-white animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Synthesizing Engineering Knowledge</h4>
                  <p className="text-xs text-neutral-400">
                    Analyzing syllabus prerequisites, formulas, and common exam traps...
                  </p>
                </div>
              </div>
            )}

            {resultData && !isLoading && (
              <div className="space-y-4 flex-1">
                {/* Result header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Generated Successfully
                    </span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-300">{topicName}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(JSON.stringify(resultData, null, 2))}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>

                {/* 1. Summary Output */}
                {resultData.summary && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-neutral-950 text-xs text-neutral-200 leading-relaxed whitespace-pre-line border border-neutral-800 font-sans">
                      {resultData.summary}
                    </div>

                    {resultData.keyFormulas && resultData.keyFormulas.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                        <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                          Formulas & Equations
                        </div>
                        <div className="space-y-1 font-mono text-xs text-emerald-300">
                          {resultData.keyFormulas.map((f: string, i: number) => (
                            <div key={i} className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resultData.bulletPoints && (
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Core Invariants
                        </div>
                        <ul className="text-xs text-neutral-300 list-disc list-inside space-y-1">
                          {resultData.bulletPoints.map((bp: string, i: number) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Quiz Output */}
                {resultData.questions && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {resultData.questions.length} Practice Questions Generated
                      </span>
                      <button
                        onClick={() => setActiveTab('quiz')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1"
                      >
                        <span>Open in Quiz Mode</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {resultData.questions.map((q: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="text-xs font-bold text-white">
                            Q{idx + 1}. {q.question}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options?.map((opt: string, oi: number) => (
                              <div
                                key={oi}
                                className={`p-2 rounded-lg text-xs border ${
                                  oi === q.correctIndex
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-900">
                            <strong className="text-neutral-300">Explanation:</strong> {q.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Flashcards Output */}
                {resultData.flashcards && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {resultData.flashcards.length} Flashcards Synthesized
                      </span>
                      <button
                        onClick={handleSaveGeneratedFlashcards}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition flex items-center gap-1"
                      >
                        <span>Save to Mastery Deck</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {resultData.flashcards.map((fc: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-cyan-400">Question</div>
                          <div className="text-xs font-medium text-white">{fc.front}</div>
                          <div className="text-[10px] uppercase font-bold text-emerald-400 pt-1">Answer</div>
                          <div className="text-xs text-neutral-300 whitespace-pre-line">{fc.back}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Explain Output */}
                {resultData.explanation && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                      {resultData.explanation}
                    </div>
                    {resultData.keyTakeaway && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span><strong>Lock-in Takeaway:</strong> {resultData.keyTakeaway}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Resources Output */}
                {resultData.resources && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-white mb-2">
                      Recommended Engineering Portals
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {resultData.resources.map((r: any, idx: number) => (
                        <a
                          key={idx}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 flex items-start justify-between gap-3 group transition"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                              {r.title}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-medium">{r.provider}</div>
                            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{r.description}</p>
                          </div>
                          <Compass className="w-4 h-4 text-neutral-500 group-hover:text-white flex-shrink-0 mt-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
