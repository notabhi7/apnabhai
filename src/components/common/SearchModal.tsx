import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, CalendarCheck, Layers, Compass, ArrowRight } from 'lucide-react';
import { useApp, AppTab } from '../../context/AppContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { notes, deadlines, flashcards, resources, subjects, setActiveTab, setSelectedSubjectId } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredNotes = q
    ? notes.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.topic.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const filteredDeadlines = q
    ? deadlines.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q))
      ).slice(0, 3)
    : [];

  const filteredFlashcards = q
    ? flashcards.filter(
        fc =>
          fc.front.toLowerCase().includes(q) ||
          fc.back.toLowerCase().includes(q) ||
          fc.topic.toLowerCase().includes(q) ||
          fc.tag.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredResources = q
    ? resources.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.provider.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const hasResults =
    filteredNotes.length > 0 ||
    filteredDeadlines.length > 0 ||
    filteredFlashcards.length > 0 ||
    filteredResources.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Input box */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all notes, algorithms, definitions, deadlines, flashcards..."
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-400">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query && (
            <div className="text-center py-8 text-neutral-500 text-xs">
              <p className="mb-2">Type a keyword like <span className="text-indigo-400 font-mono">Dijkstra</span>, <span className="text-indigo-400 font-mono">Semaphore</span>, <span className="text-indigo-400 font-mono">BCNF</span>, or <span className="text-indigo-400 font-mono">Mid-Term</span></p>
              <p className="text-[11px] text-neutral-600">Quickly jumps to notes, revision summaries, flashcards, and syllabus topics.</p>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No results found for &ldquo;<span className="text-white">{query}</span>&rdquo;. Try searching for broader engineering terms.
            </div>
          )}

          {/* Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Lecture Notes & Summaries
              </div>
              <div className="space-y-1.5">
                {filteredNotes.map(n => {
                  const sub = subjects.find(s => s.id === n.subjectId);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedSubjectId(n.subjectId);
                        setActiveTab('notes');
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 cursor-pointer flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span className="text-indigo-400 font-medium">{sub?.code || 'CS'}</span>
                          <span>•</span>
                          <span>{n.topic}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deadlines */}
          {filteredDeadlines.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-rose-400" />
                Deadlines & Exams
              </div>
              <div className="space-y-1.5">
                {filteredDeadlines.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveTab('deadlines');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 cursor-pointer flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{d.title}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400 font-medium">Due {d.dueDate}</span>
                        <span>•</span>
                        <span className="capitalize">{d.type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                      {d.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flashcards */}
          {filteredFlashcards.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Flashcards & Recall Cards
              </div>
              <div className="space-y-1.5">
                {filteredFlashcards.map(fc => (
                  <div
                    key={fc.id}
                    onClick={() => {
                      setActiveTab('flashcards');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 cursor-pointer flex items-center justify-between group transition"
                  >
                    <div className="max-w-[85%]">
                      <div className="text-xs font-medium text-white line-clamp-1">{fc.front}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{fc.back}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {fc.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Study Resources
              </div>
              <div className="space-y-1.5">
                {filteredResources.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setActiveTab('resources');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 cursor-pointer flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{r.title}</div>
                      <div className="text-[11px] text-emerald-400">{r.provider}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
