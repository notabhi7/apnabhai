import React, { useState } from 'react';
import {
  Library,
  Search,
  BookOpen,
  HelpCircle,
  Layers,
  Brain,
  Trash2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { RevisionNote, FlashcardDeck, QuizAttempt, ExplanationResult } from '../../types';

export const StudyLibraryView: React.FC = () => {
  const {
    savedNotes,
    savedDecks,
    quizAttempts,
    currentExplanation,
    deleteNote,
    deleteDeck,
    setCurrentNote,
    setCurrentDeck,
    setActivePage,
    showToast
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'notes' | 'quizzes' | 'flashcards' | 'explanations'>('all');

  // Deletion confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'note' | 'deck';
    id: string;
    title: string;
  } | null>(null);

  const handleOpenNote = (note: RevisionNote) => {
    setCurrentNote(note);
    setActivePage('revision-notes');
  };

  const handleOpenDeck = (deck: FlashcardDeck) => {
    setCurrentDeck(deck);
    setActivePage('flashcards');
  };

  const handleOpenExplanation = () => {
    setActivePage('ai-tutor');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'note') {
      deleteNote(deleteTarget.id);
    } else if (deleteTarget.type === 'deck') {
      deleteDeck(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  // Filter logic
  const query = searchQuery.toLowerCase().trim();

  const filteredNotes = savedNotes.filter(
    n => n.title.toLowerCase().includes(query) || n.topic.toLowerCase().includes(query) || n.subject.toLowerCase().includes(query)
  );

  const filteredDecks = savedDecks.filter(
    d => d.topic.toLowerCase().includes(query)
  );

  const filteredAttempts = quizAttempts.filter(
    q => q.topic.toLowerCase().includes(query)
  );

  const hasExplanation = currentExplanation && currentExplanation.saved && (
    currentExplanation.topic.toLowerCase().includes(query) || currentExplanation.title.toLowerCase().includes(query)
  );

  const totalItemCount =
    savedNotes.length + savedDecks.length + quizAttempts.length + (currentExplanation?.saved ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 mb-2">
            <Library className="w-3.5 h-3.5" />
            <span>Academic Vault & Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Saved Study Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, search, review, and manage all your saved revision guides, quizzes, and flashcard decks.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start md:self-auto">
          {totalItemCount} Saved Items
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search across topics, subjects, key terms..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'notes', label: `Notes (${savedNotes.length})` },
              { id: 'quizzes', label: `Quizzes (${quizAttempts.length})` },
              { id: 'flashcards', label: `Decks (${savedDecks.length})` },
              { id: 'explanations', label: 'Explanations' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Library Assets Grid */}
      <div className="space-y-8">
        {/* Section 1: Revision Notes */}
        {(filterTab === 'all' || filterTab === 'notes') && filteredNotes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" />
              <span>Revision Notes ({filteredNotes.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleOpenNote(note)}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 cursor-pointer transition shadow-xs hover:shadow-md space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                      {note.subject}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'note', id: note.id, title: note.title || note.topic });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition line-clamp-1">
                    {note.title || note.topic}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {note.overview}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1">
                      <span>Open Note</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Flashcard Decks */}
        {(filterTab === 'all' || filterTab === 'flashcards') && filteredDecks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Flashcard Decks ({filteredDecks.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map(deck => {
                const known = deck.cards.filter(c => c.status === 'known').length;
                const percent = Math.round((known / deck.cards.length) * 100);

                return (
                  <div
                    key={deck.id}
                    onClick={() => handleOpenDeck(deck)}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition shadow-xs hover:shadow-md space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {deck.cards.length} Cards
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: 'deck', id: deck.id, title: deck.topic });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                        title="Delete Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition line-clamp-1">
                      {deck.topic}
                    </h4>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Mastery</span>
                        <span className="font-bold text-emerald-600">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                        <span>Study Deck</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Quiz Attempts History */}
        {(filterTab === 'all' || filterTab === 'quizzes') && filteredAttempts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Quiz Attempts & Scorecard ({filteredAttempts.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAttempts.map(att => (
                <div
                  key={att.id}
                  onClick={() => setActivePage('quiz-generator')}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition shadow-xs hover:shadow-md space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Exam Result
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        att.percentage >= 80
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {att.percentage}% Score
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition line-clamp-1">
                    {att.topic}
                  </h4>

                  <p className="text-xs text-slate-500">
                    Earned <strong className="text-slate-800 dark:text-slate-200">{att.score} out of {att.totalPoints} points</strong> across multiple assessment questions.
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <span>Retake / Review</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Bookmarked Explanation */}
        {(filterTab === 'all' || filterTab === 'explanations') && hasExplanation && currentExplanation && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span>Bookmarked Explanations</span>
            </h3>

            <div
              onClick={handleOpenExplanation}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition shadow-xs hover:shadow-md space-y-3 group max-w-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {currentExplanation.difficulty} Level
                </span>
                <span className="text-[10px] text-slate-400">Bookmarked</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                {currentExplanation.title || currentExplanation.topic}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-2">
                {currentExplanation.summary}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{new Date(currentExplanation.createdAt).toLocaleDateString()}</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <span>Open in AI Tutor</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {filteredNotes.length === 0 && filteredDecks.length === 0 && filteredAttempts.length === 0 && !hasExplanation && (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Materials Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No materials matched your query "${searchQuery}". Try a different keyword.`
                : 'Your library is empty. Generate revision notes, flashcards, or take a quiz to populate your library!'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Asset Deletion */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Study Asset?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>? This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
