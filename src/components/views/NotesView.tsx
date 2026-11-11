import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Bookmark,
  Sparkles,
  HelpCircle,
  Layers,
  Compass,
  Code2,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  Check,
  ChevronRight,
  BookMarked,
  Share2,
  AlertTriangle,
  Lightbulb,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LectureNote, Subject } from '../../types';

interface NotesViewProps {
  onOpenNewNoteModal: () => void;
  onEditNoteModal: (note: LectureNote) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  onOpenNewNoteModal,
  onEditNoteModal
}) => {
  const {
    notes,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    deleteNote,
    toggleBookmarkNote,
    requestSummary,
    requestQuiz,
    requestFlashcards,
    requestResources,
    setActiveTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (selectedSubjectId && n.subjectId !== selectedSubjectId) return false;
    if (selectedTag && !n.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeNote = notes.find(n => n.id === activeNoteId) || filteredNotes[0] || null;
  const activeSubject = subjects.find(s => s.id === activeNote?.subjectId);

  // All distinct tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  // AI Summarize handler
  const handleSummarize = async (note: LectureNote, style: string = 'exam_cheatsheet') => {
    setSummarizingId(note.id);
    setAiActionMessage('Generating High-Yield B.Tech Exam Summary with Gemini...');
    try {
      await requestSummary(note, style);
      setAiActionMessage('Exam summary generated and saved to this note!');
      setTimeout(() => setAiActionMessage(null), 4000);
    } catch (err: any) {
      setAiActionMessage('Failed to generate summary: ' + err.message);
    } finally {
      setSummarizingId(null);
    }
  };

  // AI Quiz generation from note
  const handleCreateQuizFromNote = async (note: LectureNote) => {
    setAiActionMessage('Drafting 5 university exam questions from this note...');
    try {
      const sub = subjects.find(s => s.id === note.subjectId);
      await requestQuiz(sub?.name || 'Computer Science', note.topic, note.content, 'medium');
      setActiveTab('quiz');
    } catch (err: any) {
      setAiActionMessage('Quiz creation error: ' + err.message);
    }
  };

  // AI Flashcards from note
  const handleCreateFlashcardsFromNote = async (note: LectureNote) => {
    setAiActionMessage('Synthesizing active recall flashcards...');
    try {
      const sub = subjects.find(s => s.id === note.subjectId);
      await requestFlashcards(sub?.name || 'Computer Science', note.topic, note.content);
      setActiveTab('flashcards');
    } catch (err: any) {
      setAiActionMessage('Flashcard creation error: ' + err.message);
    }
  };

  // AI Curated resources from note
  const handleFindResourcesFromNote = async (note: LectureNote) => {
    setAiActionMessage('Curating NPTEL & interactive visualizers...');
    try {
      const sub = subjects.find(s => s.id === note.subjectId);
      await requestResources(sub?.name || 'Computer Science', note.topic);
      setActiveTab('resources');
    } catch (err: any) {
      setAiActionMessage('Resource fetch error: ' + err.message);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Bar with Subject Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Lecture Notes & Syllabus Modules
          </h2>
          <p className="text-xs text-neutral-400">
            Organized by B.Tech courses with instant AI summarization and active recall
          </p>
        </div>

        <button
          onClick={onOpenNewNoteModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lecture Note</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* All Subjects pill */}
        <button
          onClick={() => setSelectedSubjectId(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            selectedSubjectId === null
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-transparent'
          }`}
        >
          All Subjects ({notes.length})
        </button>

        {subjects.map(s => {
          const isSelected = selectedSubjectId === s.id;
          const count = notes.filter(n => n.subjectId === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(isSelected ? null : s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                isSelected
                  ? 'bg-neutral-800 text-white border-neutral-700 shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white border-transparent'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.code}</span>
              <span className="text-[10px] text-neutral-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Pane View: Note List + Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* Left column: List of Notes (4 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search box inside notes list */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter notes by topic, tag, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags list */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags:
              </span>
              {allTags.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] whitespace-nowrap transition ${
                    selectedTag === t
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Notes Cards Scrollable List */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs">
                No lecture notes match this filter. Create one to get started!
              </div>
            ) : (
              filteredNotes.map(note => {
                const isSelected = activeNote?.id === note.id;
                const sub = subjects.find(s => s.id === note.subjectId);
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left relative group ${
                      isSelected
                        ? 'bg-neutral-850 border-indigo-500/60 shadow-lg'
                        : 'bg-neutral-900/90 hover:bg-neutral-850/80 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: sub?.color || '#6366F1' }}
                        >
                          {sub?.code || 'CS'}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Module {note.moduleNumber}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            note.difficulty === 'Hard'
                              ? 'bg-rose-500/10 text-rose-300'
                              : note.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          {note.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleBookmarkNote(note.id);
                        }}
                        className={`text-neutral-500 hover:text-amber-400 transition ${
                          note.bookmarked ? 'text-amber-400' : ''
                        }`}
                      >
                        <Bookmark
                          className="w-4 h-4"
                          fill={note.bookmarked ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-1 group-hover:text-indigo-300 transition">
                      {note.title}
                    </h3>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                      {note.summary || note.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2.5 pt-2 border-t border-neutral-800/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {note.date}
                      </span>
                      {note.summary && (
                        <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          AI Cheatsheet ready
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Note Details & AI Actions (7 cols on lg) */}
        <div className="lg:col-span-7">
          {activeNote ? (
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-6">
              {/* Status message */}
              {aiActionMessage && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                    {aiActionMessage}
                  </span>
                  <button
                    onClick={() => setAiActionMessage(null)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: activeSubject?.color || '#6366F1' }}
                    >
                      {activeSubject?.code}: {activeSubject?.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Module {activeNote.moduleNumber} • {activeNote.topic}
                    </span>
                  </div>

                  <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                    {activeNote.title}
                  </h1>

                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>Recorded on {activeNote.date}</span>
                    <span>•</span>
                    <span>Difficulty: <strong className="text-neutral-300">{activeNote.difficulty}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start">
                  <button
                    onClick={() => onEditNoteModal(activeNote)}
                    className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 transition"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-750 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick AI Engineering Action Ribbon */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Learning Accelerator</div>
                    <div className="text-[10px] text-neutral-400">One-click exam preparation tools</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleSummarize(activeNote, 'exam_cheatsheet')}
                    disabled={summarizingId === activeNote.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{summarizingId === activeNote.id ? 'Summarizing...' : 'Summarize'}</span>
                  </button>

                  <button
                    onClick={() => handleCreateQuizFromNote(activeNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Make Quiz</span>
                  </button>

                  <button
                    onClick={() => handleCreateFlashcardsFromNote(activeNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Flashcards</span>
                  </button>

                  <button
                    onClick={() => handleFindResourcesFromNote(activeNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Resources</span>
                  </button>
                </div>
              </div>

              {/* AI Generated High-Yield Summary Box if available */}
              {activeNote.summary && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      High-Yield Exam Cheatsheet
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Gemini Verified
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                    {activeNote.summary}
                  </p>

                  {/* Key Formulas / equations */}
                  {activeNote.keyFormulas && activeNote.keyFormulas.length > 0 && (
                    <div className="pt-2 border-t border-indigo-500/20">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                        Key Equations & Bounds
                      </div>
                      <div className="space-y-1">
                        {activeNote.keyFormulas.map((f, i) => (
                          <div
                            key={i}
                            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950/80 text-emerald-300 border border-neutral-800"
                          >
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Exam Mistakes */}
                  {activeNote.commonMistakes && activeNote.commonMistakes.length > 0 && (
                    <div className="pt-2 border-t border-indigo-500/20">
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Common Exam Pitfalls
                      </div>
                      <ul className="text-xs text-neutral-300 list-disc list-inside space-y-0.5">
                        {activeNote.commonMistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Note Content (Markdown-like formatting) */}
              <div className="space-y-3 text-sm text-neutral-200 leading-relaxed font-sans">
                <div className="whitespace-pre-line bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800/80">
                  {activeNote.content}
                </div>

                {/* Code Snippet Box if available */}
                {activeNote.codeSnippet && (
                  <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 mt-4">
                    <div className="px-4 py-2 bg-neutral-850 flex items-center justify-between border-b border-neutral-800">
                      <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        Implementation ({activeNote.codeSnippet.language})
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeNote.codeSnippet?.code || '');
                          setAiActionMessage('Code copied to clipboard!');
                          setTimeout(() => setAiActionMessage(null), 2500);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-white transition"
                      >
                        Copy Code
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                      <code>{activeNote.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Tags footer */}
              <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-neutral-500 mr-1">Tags:</span>
                {activeNote.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-sm">
              Select or create a lecture note to view details and AI actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
