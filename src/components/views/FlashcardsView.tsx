import React, { useState, useEffect } from 'react';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Bookmark,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../../types';

interface FlashcardsViewProps {
  onOpenNewFlashcardModal: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onOpenNewFlashcardModal }) => {
  const {
    flashcards,
    subjects,
    updateFlashcardMastery,
    deleteFlashcard,
    selectedSubjectId,
    setSelectedSubjectId,
    setActiveTab
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterMastery, setFilterMastery] = useState<'all' | 'learning' | 'mastered'>('all');

  // Filter flashcards
  const filteredCards = flashcards.filter(fc => {
    if (selectedSubjectId && fc.subjectId !== selectedSubjectId) return false;
    if (filterMastery === 'learning' && fc.masteryLevel === 2) return false;
    if (filterMastery === 'mastered' && fc.masteryLevel !== 2) return false;
    return true;
  });

  // Keep index in range
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredCards.length, currentIndex]);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];
  const currentSubject = subjects.find(s => s.id === currentCard?.subjectId);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '1' && currentCard) {
        handleSetMastery(0);
      } else if (e.key === '2' && currentCard) {
        handleSetMastery(1);
      } else if (e.key === '3' && currentCard) {
        handleSetMastery(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentCard, filteredCards.length]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    const randomIdx = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIdx);
  };

  const handleSetMastery = (level: 0 | 1 | 2) => {
    if (!currentCard) return;
    updateFlashcardMastery(currentCard.id, level);
    if (level === 2) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    }
    handleNext();
  };

  // Metrics
  const masteredCount = flashcards.filter(f => f.masteryLevel === 2).length;
  const learningCount = flashcards.filter(f => f.masteryLevel < 2).length;
  const masteryPercentage = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Active Recall Flashcards Deck
          </h2>
          <p className="text-xs text-neutral-400">
            Spaced repetition for definitions, time-complexity, theorem derivations, and exam traps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ai-studio')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Synthesizer</span>
          </button>

          <button
            onClick={onOpenNewFlashcardModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Flashcard</span>
          </button>
        </div>
      </div>

      {/* Progress & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Retention progress card */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Deck Retention Score</div>
            <div className="text-2xl font-bold text-white mt-1">{masteryPercentage}%</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">
              {masteredCount} Mastered • {learningCount} Practicing
            </div>
          </div>
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-neutral-800" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - masteryPercentage / 100)}
                strokeLinecap="round"
                className="text-cyan-400"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-white">{masteryPercentage}%</span>
          </div>
        </div>

        {/* Subject filter */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <label className="text-xs text-neutral-400 font-semibold mb-1">Filter by Course:</label>
          <select
            value={selectedSubjectId || 'all'}
            onChange={e => setSelectedSubjectId(e.target.value === 'all' ? null : e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Subjects ({flashcards.length} cards)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <label className="text-xs text-neutral-400 font-semibold mb-1">Mastery Status:</label>
          <div className="flex p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            {(['all', 'learning', 'mastered'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterMastery(st)}
                className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-lg transition ${
                  filterMastery === st
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-3">
          <Layers className="w-12 h-12 mx-auto text-neutral-600" />
          <h3 className="text-base font-bold text-white">No flashcards found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try switching filters or generate a fresh deck using our AI Study Studio from your lecture notes.
          </p>
        </div>
      ) : currentCard ? (
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Card counter and shuffle */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-2">
            <span className="font-mono">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  currentCard.masteryLevel === 2
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentCard.masteryLevel === 1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {currentCard.masteryLevel === 2
                  ? 'Mastered'
                  : currentCard.masteryLevel === 1
                  ? 'Practicing'
                  : 'Needs Review'}
              </span>

              <button
                onClick={handleShuffle}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Shuffle Cards"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 min-h-[320px] cursor-pointer group select-none"
          >
            <div
              className={`w-full h-full min-h-[320px] rounded-3xl border transition-all duration-500 transform-style-3d p-8 flex flex-col justify-between shadow-2xl relative ${
                isFlipped
                  ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950/40 border-indigo-500/40'
                  : 'bg-neutral-900 hover:bg-neutral-850/90 border-neutral-800'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: currentSubject?.color || '#6366F1' }}
                  >
                    {currentSubject?.code || 'CS'}
                  </span>
                  <span className="text-xs text-neutral-400">{currentCard.topic}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 group-hover:text-neutral-300 transition">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click or press Space to {isFlipped ? 'flip back' : 'reveal answer'}</span>
                </div>
              </div>

              {/* Center Content */}
              <div className="my-6">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Core Concept / Problem
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                      {currentCard.front}
                    </h3>

                    {currentCard.hint && (
                      <div className="pt-2">
                        {showHint ? (
                          <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                            <strong>Hint:</strong> {currentCard.hint}
                          </div>
                        ) : (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setShowHint(true);
                            }}
                            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Show mnemonic hint</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Explanation & Proof
                    </span>
                    <div className="text-sm md:text-base text-neutral-100 leading-relaxed whitespace-pre-line font-sans">
                      {currentCard.back}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer tags */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-800">
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                  #{currentCard.tag}
                </span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteFlashcard(currentCard.id);
                  }}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                  title="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grading & Navigation Controls */}
          <div className="space-y-3">
            {/* Active Recall Grading Buttons (1, 2, 3) */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSetMastery(0)}
                className="py-2.5 px-3 rounded-2xl bg-neutral-900 hover:bg-rose-950/30 border border-neutral-800 hover:border-rose-500/40 text-neutral-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Hard (Press 1)</span>
              </button>

              <button
                onClick={() => handleSetMastery(1)}
                className="py-2.5 px-3 rounded-2xl bg-neutral-900 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Good (Press 2)</span>
              </button>

              <button
                onClick={() => handleSetMastery(2)}
                className="py-2.5 px-3 rounded-2xl bg-neutral-900 hover:bg-emerald-950/30 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Mastered (Press 3)</span>
              </button>
            </div>

            {/* Carousel navigation arrows */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850 transition"
                title="Previous card (Arrow Left)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-6 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                {isFlipped ? 'Show Front' : 'Show Answer'}
              </button>

              <button
                onClick={handleNext}
                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850 transition"
                title="Next card (Arrow Right)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
