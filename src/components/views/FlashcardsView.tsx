import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  Plus,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { ExplanationDifficulty, Flashcard } from '../../types';

export const FlashcardsView: React.FC = () => {
  const {
    currentDeck,
    savedDecks,
    isGeneratingFlashcards,
    generateFlashcards,
    saveCurrentDeck,
    updateCardStatus,
    deleteDeck,
    setCurrentDeck,
    addNewCardToDeck,
    showToast
  } = useStudy();

  const [topicInput, setTopicInput] = useState('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<ExplanationDifficulty>('Intermediate');

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // New custom card modal
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newTag, setNewTag] = useState('Core Concept');

  const sampleTopics = [
    'Transformer Attention',
    'Process States & IPC',
    'Transaction Isolation Levels',
    'Zero-Shot vs Few-Shot',
    'Transport Protocols'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || isGeneratingFlashcards) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(0);
    await generateFlashcards(topicInput.trim(), cardCount, difficulty);
  };

  const handleSelectSample = (sample: string) => {
    setTopicInput(sample);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(0);
    generateFlashcards(sample, cardCount, difficulty);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardFeedback = (status: 'known' | 'learning') => {
    if (!currentDeck || !currentDeck.cards[currentCardIndex]) return;
    const card = currentDeck.cards[currentCardIndex];
    updateCardStatus(currentDeck.id, card.id, status);

    if (currentCardIndex < currentDeck.cards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentCardIndex(prev => prev + 1);
    } else {
      showToast('Deck review finished!', 'success');
    }
  };

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDeck || !newQuestion.trim() || !newAnswer.trim()) return;
    addNewCardToDeck(currentDeck.id, {
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      hint: newHint.trim() || undefined,
      tag: newTag.trim() || 'Custom'
    });
    setNewQuestion('');
    setNewAnswer('');
    setNewHint('');
    setIsAddingCard(false);
  };

  const currentCards = currentDeck?.cards || [];
  const cardToDisplay: Flashcard | undefined = currentCards[currentCardIndex];
  const knownCount = currentCards.filter(c => c.status === 'known').length;
  const learningCount = currentCards.filter(c => c.status === 'learning').length;
  const progressPercent = currentCards.length ? Math.round((knownCount / currentCards.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Spaced Repetition Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Active Recall Flashcards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solidify long-term retention with 3D flip card drills and confidence tracking.
          </p>
        </div>

        {currentDeck && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingCard(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              <span>Add Card</span>
            </button>
            <button
              onClick={saveCurrentDeck}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{currentDeck.saved ? 'Saved' : 'Save Deck'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Generator Config Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Enter flashcard topic (e.g. Attention, Process States, SQL Joins)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isGeneratingFlashcards || !topicInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingFlashcards ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Cards</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Size:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
                {[6, 10, 15].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCardCount(num)}
                    className={`py-1 text-xs font-semibold rounded-lg transition ${
                      cardCount === num
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>

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

      {/* Main Flashcard Deck */}
      {isGeneratingFlashcards ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Formulating Active Recall Cards...
          </h3>
          <p className="text-xs text-slate-400">
            Extracting definitions and high-yield question pairs.
          </p>
        </div>
      ) : currentDeck && cardToDisplay ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3D Card & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Deck Header & Progress */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentDeck.topic}
                </span>
                <span className="text-slate-400 ml-2">
                  (Card {currentCardIndex + 1} of {currentCards.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-semibold">{knownCount} Mastered</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-semibold">{learningCount} Learning</span>
                <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={handleFlip}
              className="relative w-full h-[320px] sm:h-[350px] cursor-pointer group select-none [perspective:1000px]"
            >
              <div
                className={`w-full h-full duration-500 transition-transform [transform-style:preserve-3d] rounded-3xl ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {cardToDisplay.tag || 'Question'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Click to reveal answer</span>
                    </span>
                  </div>

                  <div className="my-auto text-center space-y-3">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                      {cardToDisplay.question}
                    </h3>
                    {showHint && cardToDisplay.hint && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/60 max-w-sm mx-auto">
                        💡 Hint: {cardToDisplay.hint}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {cardToDisplay.hint ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        cardToDisplay.status === 'known'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : cardToDisplay.status === 'learning'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cardToDisplay.status}
                    </span>
                  </div>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/30 shadow-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Answer Key
                    </span>
                    <span className="text-xs text-indigo-200/60 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Flip back</span>
                    </span>
                  </div>

                  <div className="my-auto text-center">
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed max-w-lg mx-auto">
                      {cardToDisplay.answer}
                    </p>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-white/10">
                    Grade your recall below:
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCardFeedback('learning')}
                className="py-2.5 px-3 rounded-2xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <XCircle className="w-4 h-4 text-amber-500" />
                <span>Still Learning</span>
              </button>

              <button
                onClick={() => handleCardFeedback('known')}
                className="py-2.5 px-3 rounded-2xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Mastered / Known</span>
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between pt-1">
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setShowHint(false);
                  setCurrentCardIndex(prev => prev - 1);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {currentCards.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsFlipped(false);
                      setShowHint(false);
                      setCurrentCardIndex(idx);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      currentCardIndex === idx
                        ? 'bg-blue-600 scale-125'
                        : c.status === 'known'
                        ? 'bg-emerald-400'
                        : c.status === 'learning'
                        ? 'bg-amber-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentCardIndex === currentCards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setShowHint(false);
                  setCurrentCardIndex(prev => prev + 1);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Deck Card List & Saved Decks (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Deck Cards ({currentCards.length})
                </span>
                <span className="text-slate-400">Jump to card</span>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {currentCards.map((card, idx) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setCurrentCardIndex(idx);
                      setIsFlipped(false);
                      setShowHint(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                      currentCardIndex === idx
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-800 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate max-w-[180px]">
                      {idx + 1}. {card.question}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        card.status === 'known'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : card.status === 'learning'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Decks */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Saved Decks
                </span>
                <span className="text-slate-400">{savedDecks.length} Total</span>
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {savedDecks.length > 0 ? (
                  savedDecks.map(deck => (
                    <div
                      key={deck.id}
                      onClick={() => {
                        setCurrentDeck(deck);
                        setCurrentCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 group ${
                        currentDeck.id === deck.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {deck.topic}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {deck.cards.length} cards
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDeck(deck.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No other decks saved yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Recall Flashcards
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Input a concept to generate an interactive 3D flashcard deck.
          </p>
        </div>
      )}

      {/* Modal: Add Custom Card */}
      {isAddingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Custom Flashcard
            </h3>

            <form onSubmit={handleCreateCustomCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="e.g. Difference between process and thread?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Answer
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  placeholder="e.g. A process owns an address space, whereas threads share memory..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Hint (Optional)
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={e => setNewHint(e.target.value)}
                  placeholder="e.g. Address space vs execution context"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
