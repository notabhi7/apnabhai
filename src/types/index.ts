export type ThemeMode = 'dark' | 'light' | 'midnight' | 'sepia';
export type AccentColor = 'rose' | 'pink' | 'lavender' | 'peach' | 'coral' | 'indigo' | 'emerald';

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. CS-201
  semester: number;
  color: string;
  iconName: string;
  professor: string;
  credits: number;
  syllabusProgress: number; // 0 - 100
  targetGrade: string; // e.g. A+
  description?: string;
}

export interface LectureNote {
  id: string;
  subjectId: string;
  title: string;
  topic: string;
  moduleNumber: number;
  content: string;
  summary?: string;
  keyFormulas?: string[];
  bulletPoints?: string[];
  commonMistakes?: string[];
  tags: string[];
  date: string;
  bookmarked: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export type DeadlineType = 'Assignment' | 'Lab Exam' | 'Mid-Term' | 'End-Term' | 'Project' | 'Quiz';
export type DeadlinePriority = 'High' | 'Medium' | 'Low';
export type DeadlineStatus = 'pending' | 'in_progress' | 'completed';

export interface Deadline {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD or ISO string
  dueTime?: string;
  type: DeadlineType;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  weightagePercentage: number;
  notes?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
  difficulty: 'easy' | 'medium' | 'gate_exam_hard';
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
  timeSpentSeconds: number;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  front: string;
  back: string;
  hint?: string;
  masteryLevel: 0 | 1 | 2; // 0 = learning, 1 = practicing, 2 = mastered
  lastReviewed?: string;
  tag: string;
}

export type ResourceType = 'video_course' | 'article_and_code' | 'interactive_tool' | 'academic_notes' | 'practice_questions';

export interface CuratedResource {
  id: string;
  subjectId: string;
  topic: string;
  title: string;
  provider: string;
  type: ResourceType;
  url: string;
  description: string;
  rating: number;
  estimatedHours: string;
  bookmarked: boolean;
}

export interface StudyScheduleItem {
  id: string;
  day: string; // Monday, Tuesday, etc.
  timeBlock: string;
  subjectId: string;
  focusTopic: string;
  sessionType: string;
  difficulty: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string; // e.g. Class Rep, Top Scorer, Peer
  text: string;
  timestamp: string;
  noteSnippet?: string;
  isMe?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  subjectCode: string;
  membersCount: number;
  activeNow: number;
  description: string;
  tags: string[];
  meetLink?: string;
  messages: GroupMessage[];
  sharedNotesCount: number;
}

export interface UserPreferences {
  theme: ThemeMode;
  accent: AccentColor;
  dailyStudyTargetHours: number;
  offlineMode: boolean;
  pomodoroWorkMins: number;
  pomodoroBreakMins: number;
  soundEnabled: boolean;
  syncDeviceId: string;
  lastSyncedAt: string;
}

export interface AcademicGoal {
  currentCGPA: number;
  targetCGPA: number;
  currentSemester: number;
  totalSemesters: number;
  totalCredits: number;
  completedCredits: number;
  studyStreakDays: number;
  totalStudyMinutes: number;
  attendanceRate: number; // percentage
}
