import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  LectureNote,
  Deadline,
  Flashcard,
  CuratedResource,
  StudyScheduleItem,
  StudyGroup,
  GroupMessage,
  UserPreferences,
  AcademicGoal,
  QuizAttempt,
  QuizQuestion,
  ThemeMode,
  AccentColor
} from '../types';
import {
  initialSubjects,
  initialNotes,
  initialDeadlines,
  initialFlashcards,
  initialResources,
  initialSchedule,
  initialStudyGroups,
  initialPreferences,
  initialAcademicGoal
} from '../data/initialData';

export type AppTab =
  | 'dashboard'
  | 'notes'
  | 'deadlines'
  | 'schedule'
  | 'ai-studio'
  | 'flashcards'
  | 'quiz'
  | 'resources'
  | 'groups'
  | 'analytics'
  | 'settings';

interface AppContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;

  // Data
  subjects: Subject[];
  notes: LectureNote[];
  deadlines: Deadline[];
  flashcards: Flashcard[];
  resources: CuratedResource[];
  schedule: StudyScheduleItem[];
  studyGroups: StudyGroup[];
  preferences: UserPreferences;
  academicGoal: AcademicGoal;
  quizAttempts: QuizAttempt[];

  // Sync & Connection
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'pending';
  syncNow: () => Promise<void>;
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;

  // Note actions
  addNote: (note: Omit<LectureNote, 'id' | 'date'>) => LectureNote;
  updateNote: (id: string, updates: Partial<LectureNote>) => void;
  deleteNote: (id: string) => void;
  toggleBookmarkNote: (id: string) => void;

  // Deadline actions
  addDeadline: (deadline: Omit<Deadline, 'id'>) => void;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  toggleDeadlineStatus: (id: string) => void;
  deleteDeadline: (id: string) => void;

  // Flashcards actions
  updateFlashcardMastery: (id: string, mastery: 0 | 1 | 2) => void;
  addFlashcardsBatch: (cards: Array<Omit<Flashcard, 'id'>>) => void;
  deleteFlashcard: (id: string) => void;

  // Schedule & Pomodoro
  toggleScheduleItem: (id: string) => void;
  addScheduleItem: (item: Omit<StudyScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
  logStudySession: (minutes: number, subjectId?: string) => void;

  // Groups
  sendMessageToGroup: (groupId: string, text: string, noteSnippet?: string) => void;

  // Subject actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;

  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateAcademicGoal: (updates: Partial<AcademicGoal>) => void;

  // AI helper actions
  requestSummary: (note: LectureNote, style?: string) => Promise<any>;
  requestQuiz: (subject: string, topic: string, content?: string, difficulty?: string) => Promise<QuizQuestion[]>;
  requestFlashcards: (subject: string, topic: string, content?: string) => Promise<any[]>;
  requestResources: (subject: string, topic: string) => Promise<CuratedResource[]>;
  requestSchedulePlan: (dailyHours?: number, targetCGPA?: number) => Promise<any>;
  recordQuizScore: (attempt: Omit<QuizAttempt, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'scholar_pulse_btech_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed reading ${key} from storage:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed saving ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Core Data loaded from LocalStorage or seeded defaults
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStorage('subjects', initialSubjects));
  const [notes, setNotes] = useState<LectureNote[]>(() => loadStorage('notes', initialNotes));
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => loadStorage('deadlines', initialDeadlines));
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => loadStorage('flashcards', initialFlashcards));
  const [resources, setResources] = useState<CuratedResource[]>(() => loadStorage('resources', initialResources));
  const [schedule, setSchedule] = useState<StudyScheduleItem[]>(() => loadStorage('schedule', initialSchedule));
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => loadStorage('studyGroups', initialStudyGroups));
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStorage('preferences', initialPreferences));
  const [academicGoal, setAcademicGoal] = useState<AcademicGoal>(() => loadStorage('academicGoal', initialAcademicGoal));
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => loadStorage('quizAttempts', []));

  // Connectivity & Sync state
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'pending'>('synced');

  const isOnline = isBrowserOnline && !preferences.offlineMode;

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => { saveStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveStorage('notes', notes); }, [notes]);
  useEffect(() => { saveStorage('deadlines', deadlines); }, [deadlines]);
  useEffect(() => { saveStorage('flashcards', flashcards); }, [flashcards]);
  useEffect(() => { saveStorage('resources', resources); }, [resources]);
  useEffect(() => { saveStorage('schedule', schedule); }, [schedule]);
  useEffect(() => { saveStorage('studyGroups', studyGroups); }, [studyGroups]);
  useEffect(() => { saveStorage('preferences', preferences); }, [preferences]);
  useEffect(() => { saveStorage('academicGoal', academicGoal); }, [academicGoal]);
  useEffect(() => { saveStorage('quizAttempts', quizAttempts); }, [quizAttempts]);

  // Apply Theme & Accent to document HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-midnight', 'theme-sepia', 'dark');

    if (preferences.theme === 'light') {
      root.classList.add('theme-light');
    } else if (preferences.theme === 'midnight') {
      root.classList.add('theme-midnight', 'dark');
    } else if (preferences.theme === 'sepia') {
      root.classList.add('theme-sepia');
    } else {
      root.classList.add('theme-dark', 'dark');
    }

    // Set accent color data attribute
    root.setAttribute('data-accent', preferences.accent);
  }, [preferences.theme, preferences.accent]);

  // Sync Now action
  const syncNow = async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    await new Promise((r) => setTimeout(r, 900));
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPreferences(prev => ({ ...prev, lastSyncedAt: `Today at ${now}` }));
    setSyncStatus('synced');
  };

  // Export & Import backup for cross-platform sync
  const exportBackup = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      deviceId: preferences.syncDeviceId,
      subjects,
      notes,
      deadlines,
      flashcards,
      resources,
      schedule,
      studyGroups,
      academicGoal,
      quizAttempts
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apnabhai_BTech_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) setSubjects(data.subjects);
      if (data.notes) setNotes(data.notes);
      if (data.deadlines) setDeadlines(data.deadlines);
      if (data.flashcards) setFlashcards(data.flashcards);
      if (data.resources) setResources(data.resources);
      if (data.schedule) setSchedule(data.schedule);
      if (data.studyGroups) setStudyGroups(data.studyGroups);
      if (data.academicGoal) setAcademicGoal(data.academicGoal);
      if (data.quizAttempts) setQuizAttempts(data.quizAttempts);
      confetti({ particleCount: 70, spread: 60 });
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  // Note actions
  const addNote = (noteData: Omit<LectureNote, 'id' | 'date'>): LectureNote => {
    const newNote: LectureNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10)
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<LectureNote>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleBookmarkNote = (id: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n)));
  };

  // Deadline actions
  const addDeadline = (data: Omit<Deadline, 'id'>) => {
    const newDl: Deadline = {
      ...data,
      id: `dl-${Date.now()}`
    };
    setDeadlines(prev => [...prev, newDl].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  const updateDeadline = (id: string, updates: Partial<Deadline>) => {
    setDeadlines(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const toggleDeadlineStatus = (id: string) => {
    setDeadlines(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const nextStatus = d.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          confetti({
            particleCount: 50,
            spread: 55,
            origin: { y: 0.6 }
          });
        }
        return { ...d, status: nextStatus };
      })
    );
  };

  const deleteDeadline = (id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  // Flashcards actions
  const updateFlashcardMastery = (id: string, mastery: 0 | 1 | 2) => {
    setFlashcards(prev =>
      prev.map(fc =>
        fc.id === id
          ? {
              ...fc,
              masteryLevel: mastery,
              lastReviewed: new Date().toISOString().slice(0, 10)
            }
          : fc
      )
    );
  };

  const addFlashcardsBatch = (cards: Array<Omit<Flashcard, 'id'>>) => {
    const newCards: Flashcard[] = cards.map((c, i) => ({
      ...c,
      id: `fc-${Date.now()}-${i}`,
      masteryLevel: 0
    }));
    setFlashcards(prev => [...newCards, ...prev]);
    confetti({ particleCount: 40, spread: 45 });
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(fc => fc.id !== id));
  };

  // Schedule
  const toggleScheduleItem = (id: string) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nextCompleted = !item.completed;
        if (nextCompleted) {
          logStudySession(45, item.subjectId);
          confetti({ particleCount: 35, spread: 40 });
        }
        return { ...item, completed: nextCompleted };
      })
    );
  };

  const addScheduleItem = (item: Omit<StudyScheduleItem, 'id'>) => {
    const newItem: StudyScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`
    };
    setSchedule(prev => [...prev, newItem]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  const logStudySession = (minutes: number, subjectId?: string) => {
    setAcademicGoal(prev => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + minutes
    }));
    if (subjectId) {
      setSubjects(prev =>
        prev.map(s => {
          if (s.id !== subjectId) return s;
          const newProgress = Math.min(100, s.syllabusProgress + 1);
          return { ...s, syllabusProgress: newProgress };
        })
      );
    }
  };

  // Groups
  const sendMessageToGroup = (groupId: string, text: string, noteSnippet?: string) => {
    const newMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderName: 'Abhi Chaudhary (You)',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      senderRole: 'B.Tech Student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      noteSnippet,
      isMe: true
    };
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, messages: [...g.messages, newMessage] } : g))
    );
  };

  // Subjects
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...data,
      id: `sub-${Date.now()}`
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const updateAcademicGoal = (updates: Partial<AcademicGoal>) => {
    setAcademicGoal(prev => ({ ...prev, ...updates }));
  };

  // AI Helper API calls
  const requestSummary = async (note: LectureNote, style: string = 'exam_cheatsheet') => {
    const subjectObj = subjects.find(s => s.id === note.subjectId);
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteTitle: note.title,
        subject: subjectObj?.name || 'Computer Science',
        content: note.content,
        style
      })
    });
    const data = await res.json();
    if (data.summary) {
      updateNote(note.id, {
        summary: data.summary,
        keyFormulas: data.keyFormulas,
        bulletPoints: data.bulletPoints,
        commonMistakes: data.commonExamMistakes
      });
    }
    return data;
  };

  const requestQuiz = async (
    subject: string,
    topic: string,
    content?: string,
    difficulty: string = 'medium'
  ): Promise<QuizQuestion[]> => {
    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, content, difficulty })
    });
    const data = await res.json();
    return data.questions || [];
  };

  const requestFlashcards = async (subject: string, topic: string, content?: string): Promise<any[]> => {
    const res = await fetch('/api/ai/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, content })
    });
    const data = await res.json();
    return data.flashcards || [];
  };

  const requestResources = async (subject: string, topic: string): Promise<CuratedResource[]> => {
    const res = await fetch('/api/ai/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic })
    });
    const data = await res.json();
    const fetched: CuratedResource[] = (data.resources || []).map((r: any, idx: number) => ({
      id: `res-gen-${Date.now()}-${idx}`,
      subjectId: selectedSubjectId || 'sub-dsa',
      topic,
      title: r.title,
      provider: r.provider,
      type: r.type || 'video_course',
      url: r.url || 'https://nptel.ac.in',
      description: r.description,
      rating: r.rating || 4.9,
      estimatedHours: r.estimatedHours || '2 Hours',
      bookmarked: false
    }));
    if (fetched.length > 0) {
      setResources(prev => [...fetched, ...prev]);
    }
    return fetched;
  };

  const requestSchedulePlan = async (dailyHours: number = 4.5, targetCGPA: number = 9.25) => {
    const res = await fetch('/api/ai/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjects: subjects.map(s => ({ name: s.name, code: s.code, progress: s.syllabusProgress })),
        examDates: deadlines.filter(d => d.type === 'Mid-Term' || d.type === 'End-Term'),
        dailyHours,
        targetCGPA
      })
    });
    return await res.json();
  };

  const recordQuizScore = (attempt: Omit<QuizAttempt, 'id' | 'date'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      date: new Date().toISOString()
    };
    setQuizAttempts(prev => [newAttempt, ...prev]);
    logStudySession(Math.round(attempt.timeSpentSeconds / 60) || 10, attempt.subjectId);
    if (attempt.score / attempt.totalQuestions >= 0.8) {
      confetti({ particleCount: 60, spread: 70 });
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedSubjectId,
        setSelectedSubjectId,
        subjects,
        notes,
        deadlines,
        flashcards,
        resources,
        schedule,
        studyGroups,
        preferences,
        academicGoal,
        quizAttempts,
        isOnline,
        syncStatus,
        syncNow,
        exportBackup,
        importBackup,
        addNote,
        updateNote,
        deleteNote,
        toggleBookmarkNote,
        addDeadline,
        updateDeadline,
        toggleDeadlineStatus,
        deleteDeadline,
        updateFlashcardMastery,
        addFlashcardsBatch,
        deleteFlashcard,
        toggleScheduleItem,
        addScheduleItem,
        deleteScheduleItem,
        logStudySession,
        sendMessageToGroup,
        addSubject,
        updateSubject,
        updatePreferences,
        updateAcademicGoal,
        requestSummary,
        requestQuiz,
        requestFlashcards,
        requestResources,
        requestSchedulePlan,
        recordQuizScore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
