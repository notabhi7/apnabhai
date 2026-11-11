import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PageView,
  ExplanationResult,
  ExplanationDifficulty,
  ExplanationStyle,
  ChatMessage,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  RevisionNote,
  FlashcardDeck,
  Flashcard,
  StudyStats
} from '../types';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface StudyContextType {
  // Navigation
  activePage: PageView;
  setActivePage: (page: PageView) => void;

  // AI Tutor
  currentExplanation: ExplanationResult | null;
  tutorChatHistory: ChatMessage[];
  isExplaining: boolean;
  isChatting: boolean;
  generateExplanation: (topic: string, difficulty: ExplanationDifficulty, style: ExplanationStyle, extraContext?: string) => Promise<ExplanationResult | null>;
  sendTutorMessage: (text: string) => Promise<void>;
  saveCurrentExplanation: () => void;

  // Quiz
  currentQuiz: Quiz | null;
  quizAttempts: QuizAttempt[];
  isGeneratingQuiz: boolean;
  generateQuiz: (topic: string, difficulty: ExplanationDifficulty, count?: number, types?: string[]) => Promise<Quiz | null>;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  saveCurrentQuiz: () => void;

  // Revision Notes
  savedNotes: RevisionNote[];
  currentNote: RevisionNote | null;
  isGeneratingNotes: boolean;
  generateNotes: (topic: string, detailLevel?: string, subject?: string) => Promise<RevisionNote | null>;
  saveCurrentNote: () => void;
  updateNote: (id: string, updates: Partial<RevisionNote>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: RevisionNote | null) => void;

  // Flashcards
  savedDecks: FlashcardDeck[];
  currentDeck: FlashcardDeck | null;
  isGeneratingFlashcards: boolean;
  generateFlashcards: (topic: string, count?: number, difficulty?: ExplanationDifficulty) => Promise<FlashcardDeck | null>;
  saveCurrentDeck: () => void;
  updateCardStatus: (deckId: string, cardId: string, status: 'known' | 'learning' | 'unreviewed') => void;
  deleteDeck: (deckId: string) => void;
  setCurrentDeck: (deck: FlashcardDeck | null) => void;
  addNewCardToDeck: (deckId: string, card: Omit<Flashcard, 'id' | 'status'>) => void;

  // Overall Stats
  studyStats: StudyStats;
  logStudyTime: (minutes: number) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_PREFIX = 'ai_study_buddy_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error loading ${key}`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key}`, e);
  }
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageView>('dashboard');

  // AI Tutor States
  const [currentExplanation, setCurrentExplanation] = useState<ExplanationResult | null>(() =>
    loadStorage('current_explanation', null)
  );
  const [tutorChatHistory, setTutorChatHistory] = useState<ChatMessage[]>(() =>
    loadStorage('tutor_chat', [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: 'Hello! I am your AI Study Buddy tutor. Enter any topic above or ask me any question to break down difficult concepts with clear analogies!',
        timestamp: 'Just now'
      }
    ])
  );
  const [isExplaining, setIsExplaining] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  // Quiz States
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(() => loadStorage('current_quiz', null));
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => loadStorage('quiz_attempts', []));
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Notes States
  const [savedNotes, setSavedNotes] = useState<RevisionNote[]>(() => loadStorage('saved_notes', []));
  const [currentNote, setCurrentNote] = useState<RevisionNote | null>(() => loadStorage('current_note', null));
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // Flashcards States
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>(() => loadStorage('saved_decks', []));
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(() => loadStorage('current_deck', null));
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Stats
  const [studyStats, setStudyStats] = useState<StudyStats>(() =>
    loadStorage('study_stats', {
      topicsExplored: 8,
      quizzesCompleted: 6,
      avgQuizScore: 88,
      notesCreated: 4,
      flashcardsMastered: 24,
      studyStreakDays: 5,
      totalMinutesStudied: 320
    })
  );

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to local storage
  useEffect(() => { saveStorage('current_explanation', currentExplanation); }, [currentExplanation]);
  useEffect(() => { saveStorage('tutor_chat', tutorChatHistory); }, [tutorChatHistory]);
  useEffect(() => { saveStorage('current_quiz', currentQuiz); }, [currentQuiz]);
  useEffect(() => { saveStorage('quiz_attempts', quizAttempts); }, [quizAttempts]);
  useEffect(() => { saveStorage('saved_notes', savedNotes); }, [savedNotes]);
  useEffect(() => { saveStorage('current_note', currentNote); }, [currentNote]);
  useEffect(() => { saveStorage('saved_decks', savedDecks); }, [savedDecks]);
  useEffect(() => { saveStorage('current_deck', currentDeck); }, [currentDeck]);
  useEffect(() => { saveStorage('study_stats', studyStats); }, [studyStats]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logStudyTime = (minutes: number) => {
    setStudyStats(prev => ({
      ...prev,
      totalMinutesStudied: prev.totalMinutesStudied + minutes
    }));
  };

  // 1. AI Tutor Actions
  const generateExplanation = async (
    topic: string,
    difficulty: ExplanationDifficulty,
    style: ExplanationStyle,
    extraContext?: string
  ): Promise<ExplanationResult | null> => {
    setIsExplaining(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, style, extraContext })
      });
      const data = await res.json();
      const result: ExplanationResult = {
        ...data,
        id: `exp-${Date.now()}`,
        topic,
        difficulty,
        style,
        createdAt: new Date().toISOString(),
        saved: false
      };
      setCurrentExplanation(result);
      setTutorChatHistory([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: `I've prepared a ${difficulty.toLowerCase()}-level explanation for **${topic}**. Feel free to ask me follow-up questions, request more analogies, or ask for code examples!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setStudyStats(prev => ({ ...prev, topicsExplored: prev.topicsExplored + 1 }));
      showToast(`Explanation generated for "${topic}"!`, 'success');
      return result;
    } catch (e: any) {
      console.error(e);
      showToast('Failed to generate explanation. Using cached educational model.', 'error');
      return null;
    } finally {
      setIsExplaining(false);
    }
  };

  const sendTutorMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTutorChatHistory(prev => [...prev, userMsg]);
    setIsChatting(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentExplanation?.topic || 'General Topic',
          messages: [...tutorChatHistory, userMsg],
          userMessage: text.trim()
        })
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTutorChatHistory(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setTutorChatHistory(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: 'I encountered a temporary connection issue. Consider how this concept fits into the broader system architecture.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const saveCurrentExplanation = () => {
    if (!currentExplanation) return;
    setCurrentExplanation(prev => (prev ? { ...prev, saved: true } : null));
    showToast('Explanation bookmarked to Study Library!', 'success');
  };

  // 2. Quiz Actions
  const generateQuiz = async (
    topic: string,
    difficulty: ExplanationDifficulty,
    count: number = 5,
    types: string[] = ['mcq', 'tf', 'short']
  ): Promise<Quiz | null> => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, questionCount: count, questionTypes: types })
      });
      const data = await res.json();
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        topic,
        difficulty,
        questions: data.questions || [],
        createdAt: new Date().toISOString(),
        saved: false
      };
      setCurrentQuiz(newQuiz);
      showToast(`Quiz with ${newQuiz.questions.length} questions ready!`, 'success');
      return newQuiz;
    } catch (e) {
      console.error(e);
      showToast('Error generating quiz', 'error');
      return null;
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const recordQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `attempt-${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    setQuizAttempts(prev => [newAttempt, ...prev]);

    // Recalculate average quiz score
    const allAttempts = [newAttempt, ...quizAttempts];
    const avg = Math.round(
      allAttempts.reduce((acc, a) => acc + a.percentage, 0) / allAttempts.length
    );

    setStudyStats(prev => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      avgQuizScore: avg
    }));

    if (newAttempt.percentage >= 80) {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    }
    showToast(`Scored ${newAttempt.percentage}% (${newAttempt.score}/${newAttempt.totalPoints} pts)!`, 'success');
  };

  const saveCurrentQuiz = () => {
    if (!currentQuiz) return;
    setCurrentQuiz(prev => (prev ? { ...prev, saved: true } : null));
    showToast('Quiz saved to Study Library!', 'success');
  };

  // 3. Revision Notes Actions
  const generateNotes = async (
    topic: string,
    detailLevel: string = 'Comprehensive',
    subject: string = 'Computer Science & AI'
  ): Promise<RevisionNote | null> => {
    setIsGeneratingNotes(true);
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, detailLevel, subject })
      });
      const data = await res.json();
      const newNote: RevisionNote = {
        ...data,
        id: `note-${Date.now()}`,
        topic,
        subject,
        detailLevel,
        createdAt: new Date().toISOString(),
        saved: true
      };
      setCurrentNote(newNote);
      setSavedNotes(prev => [newNote, ...prev]);
      setStudyStats(prev => ({ ...prev, notesCreated: prev.notesCreated + 1 }));
      showToast('Revision notes generated and saved to Library!', 'success');
      return newNote;
    } catch (e) {
      console.error(e);
      showToast('Failed generating revision notes', 'error');
      return null;
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const saveCurrentNote = () => {
    if (!currentNote) return;
    setSavedNotes(prev => {
      const exists = prev.some(n => n.id === currentNote.id);
      if (exists) {
        return prev.map(n => (n.id === currentNote.id ? currentNote : n));
      }
      return [currentNote, ...prev];
    });
    showToast('Note saved to library!', 'success');
  };

  const updateNote = (id: string, updates: Partial<RevisionNote>) => {
    setSavedNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updates, lastEditedAt: new Date().toISOString() } : n))
    );
    if (currentNote?.id === id) {
      setCurrentNote(prev => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Note updated successfully', 'success');
  };

  const deleteNote = (id: string) => {
    setSavedNotes(prev => prev.filter(n => n.id !== id));
    if (currentNote?.id === id) setCurrentNote(null);
    showToast('Note removed from library', 'info');
  };

  // 4. Flashcards Actions
  const generateFlashcards = async (
    topic: string,
    count: number = 6,
    difficulty: ExplanationDifficulty = 'Intermediate'
  ): Promise<FlashcardDeck | null> => {
    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count, difficulty })
      });
      const data = await res.json();
      const rawCards = data.flashcards || [];
      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        topic,
        createdAt: new Date().toISOString(),
        saved: true,
        cards: rawCards.map((c: any, i: number) => ({
          id: `card-${Date.now()}-${i}`,
          question: c.question,
          answer: c.answer,
          hint: c.hint,
          tag: c.tag || 'Concept',
          status: 'unreviewed'
        }))
      };
      setCurrentDeck(newDeck);
      setSavedDecks(prev => [newDeck, ...prev]);
      showToast(`Flashcard deck generated with ${newDeck.cards.length} cards!`, 'success');
      return newDeck;
    } catch (e) {
      console.error(e);
      showToast('Error generating flashcards', 'error');
      return null;
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const saveCurrentDeck = () => {
    if (!currentDeck) return;
    setSavedDecks(prev => {
      const exists = prev.some(d => d.id === currentDeck.id);
      if (exists) {
        return prev.map(d => (d.id === currentDeck.id ? currentDeck : d));
      }
      return [currentDeck, ...prev];
    });
    showToast('Flashcard deck saved!', 'success');
  };

  const updateCardStatus = (deckId: string, cardId: string, status: 'known' | 'learning' | 'unreviewed') => {
    const updater = (deck: FlashcardDeck) => {
      if (deck.id !== deckId) return deck;
      return {
        ...deck,
        cards: deck.cards.map(c =>
          c.id === cardId ? { ...c, status, lastReviewedAt: new Date().toISOString() } : c
        )
      };
    };

    setSavedDecks(prev => prev.map(updater));
    if (currentDeck?.id === deckId) {
      setCurrentDeck(prev => (prev ? updater(prev) : null));
    }

    if (status === 'known') {
      setStudyStats(prev => ({
        ...prev,
        flashcardsMastered: prev.flashcardsMastered + 1
      }));
    }
  };

  const deleteDeck = (deckId: string) => {
    setSavedDecks(prev => prev.filter(d => d.id !== deckId));
    if (currentDeck?.id === deckId) setCurrentDeck(null);
    showToast('Deck deleted', 'info');
  };

  const addNewCardToDeck = (deckId: string, card: Omit<Flashcard, 'id' | 'status'>) => {
    const newCard: Flashcard = {
      ...card,
      id: `card-${Date.now()}`,
      status: 'unreviewed'
    };
    const updater = (deck: FlashcardDeck) => {
      if (deck.id !== deckId) return deck;
      return { ...deck, cards: [...deck.cards, newCard] };
    };
    setSavedDecks(prev => prev.map(updater));
    if (currentDeck?.id === deckId) {
      setCurrentDeck(prev => (prev ? updater(prev) : null));
    }
    showToast('Card added to deck', 'success');
  };

  return (
    <StudyContext.Provider
      value={{
        activePage,
        setActivePage,
        currentExplanation,
        tutorChatHistory,
        isExplaining,
        isChatting,
        generateExplanation,
        sendTutorMessage,
        saveCurrentExplanation,
        currentQuiz,
        quizAttempts,
        isGeneratingQuiz,
        generateQuiz,
        recordQuizAttempt,
        saveCurrentQuiz,
        savedNotes,
        currentNote,
        isGeneratingNotes,
        generateNotes,
        saveCurrentNote,
        updateNote,
        deleteNote,
        setCurrentNote,
        savedDecks,
        currentDeck,
        isGeneratingFlashcards,
        generateFlashcards,
        saveCurrentDeck,
        updateCardStatus,
        deleteDeck,
        setCurrentDeck,
        addNewCardToDeck,
        studyStats,
        logStudyTime,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within StudyProvider');
  return context;
};
