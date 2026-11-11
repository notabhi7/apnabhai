export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'educator';
  studyGoalHours: number;
  joinedAt: string;
}

export type PageView =
  | 'landing'
  | 'dashboard'
  | 'ai-tutor'
  | 'quiz-generator'
  | 'revision-notes'
  | 'flashcards'
  | 'ai-concepts'
  | 'study-library'
  | 'profile-settings';

// AI Tutor Types
export type ExplanationDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExplanationStyle = 'Analogy-Rich' | 'Technical & Formal' | 'Socratic & Conceptual' | 'Executive Summary';

export interface ExplanationResult {
  id: string;
  topic: string;
  difficulty: ExplanationDifficulty;
  style: ExplanationStyle;
  title: string;
  introduction: string;
  analogy: string;
  coreMechanics: string[];
  codeOrFormula?: string;
  commonMisconceptions: string[];
  summary: string;
  createdAt: string;
  saved?: boolean;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Quiz Types
export type QuestionType = 'mcq' | 'tf' | 'short';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ or True/False
  correctIndex?: number;
  sampleAnswer?: string; // For short answer
  keyTerms?: string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: ExplanationDifficulty;
  questions: QuizQuestion[];
  createdAt: string;
  saved?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  topic: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: Record<string, string | number>;
  completedAt: string;
}

// Revision Notes Types
export interface KeyDefinition {
  term: string;
  definition: string;
}

export interface NoteSection {
  heading: string;
  content: string;
}

export interface RevisionNote {
  id: string;
  title: string;
  topic: string;
  subject: string;
  detailLevel: string;
  overview: string;
  sections: NoteSection[];
  keyDefinitions: KeyDefinition[];
  formulasAndTheorems?: string[];
  examQuickTips?: string[];
  summary: string;
  createdAt: string;
  lastEditedAt?: string;
  saved?: boolean;
  disclaimer: string;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  tag: string;
  status: 'known' | 'learning' | 'unreviewed';
  lastReviewedAt?: string;
}

export interface FlashcardDeck {
  id: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
  saved?: boolean;
}

// Core AI Topics
export interface AIConceptLesson {
  id: string;
  slug: 'prompting' | 'llms' | 'zero-shot' | 'few-shot' | 'hallucinations';
  title: string;
  tagline: string;
  description: string;
  coreDefinition: string;
  realWorldExample: string;
  comparisonTable?: {
    feature: string;
    colA: string;
    colB: string;
  }[];
  interactivePrompt: {
    label: string;
    initialPrompt: string;
    taskInput: string;
    sampleOutput: string;
    explanation: string;
  };
  quizChallenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// Study Statistics
export interface StudyStats {
  topicsExplored: number;
  quizzesCompleted: number;
  avgQuizScore: number;
  notesCreated: number;
  flashcardsMastered: number;
  studyStreakDays: number;
  totalMinutesStudied: number;
}
