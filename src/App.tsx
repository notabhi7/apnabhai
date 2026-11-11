import React, { useState } from 'react';
import { AppProvider, useApp, AppTab } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { PomodoroModal } from './components/common/PomodoroModal';
import { NewSubjectModal } from './components/common/NewSubjectModal';
import { NoteEditorModal } from './components/common/NoteEditorModal';
import { NewDeadlineModal } from './components/common/NewDeadlineModal';
import { NewFlashcardModal } from './components/common/NewFlashcardModal';
import { NewScheduleModal } from './components/common/NewScheduleModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { NotesView } from './components/views/NotesView';
import { DeadlinesView } from './components/views/DeadlinesView';
import { ScheduleView } from './components/views/ScheduleView';
import { AIStudioView } from './components/views/AIStudioView';
import { FlashcardsView } from './components/views/FlashcardsView';
import { QuizView } from './components/views/QuizView';
import { ResourcesView } from './components/views/ResourcesView';
import { GroupsView } from './components/views/GroupsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { LectureNote } from './types';
import { WifiOff, AlertTriangle } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeTab, isOnline, preferences } = useApp();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isNewSubjectOpen, setIsNewSubjectOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<LectureNote | null>(null);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewFlashcardOpen, setIsNewFlashcardOpen] = useState(false);
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);

  const handleEditNote = (note: LectureNote) => {
    setNoteToEdit(note);
    setIsNoteEditorOpen(true);
  };

  const handleCreateNote = () => {
    setNoteToEdit(null);
    setIsNoteEditorOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
            onOpenNewNote={handleCreateNote}
          />
        );
      case 'notes':
        return (
          <NotesView
            onOpenNewNoteModal={handleCreateNote}
            onEditNoteModal={handleEditNote}
          />
        );
      case 'deadlines':
        return (
          <DeadlinesView
            onOpenNewDeadlineModal={() => setIsNewDeadlineOpen(true)}
          />
        );
      case 'schedule':
        return (
          <ScheduleView
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
            onOpenNewScheduleModal={() => setIsNewScheduleOpen(true)}
          />
        );
      case 'ai-studio':
        return <AIStudioView />;
      case 'flashcards':
        return (
          <FlashcardsView
            onOpenNewFlashcardModal={() => setIsNewFlashcardOpen(true)}
          />
        );
      case 'quiz':
        return <QuizView />;
      case 'resources':
        return <ResourcesView />;
      case 'groups':
        return <GroupsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
            onOpenNewNote={handleCreateNote}
          />
        );
    }
  };

  // Determine theme background classes with feminine aesthetics
  const themeBg =
    preferences.theme === 'midnight'
      ? 'bg-[#0e070c] text-[#fff1f5]'
      : preferences.theme === 'light'
      ? 'bg-[#fff6f8] text-[#2b1120]'
      : preferences.theme === 'sepia'
      ? 'bg-[#24181a] text-[#f7ebe9]'
      : 'bg-[#170d15] text-[#ffeef3]';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeBg}`}>
      {/* Offline Mode Banner if active */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-xs px-4 py-1.5 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              <strong>Offline Mode Active:</strong> All changes are stored locally in Indexed/LocalStorage and will auto-replicate to your devices when online.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-700 px-1.5 py-0.5 rounded">
            Local Safe
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
      />

      {/* Main Workspace Body with Sidebar & View */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenNewSubject={() => setIsNewSubjectOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      <NewSubjectModal
        isOpen={isNewSubjectOpen}
        onClose={() => setIsNewSubjectOpen(false)}
      />

      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        noteToEdit={noteToEdit}
      />

      <NewDeadlineModal
        isOpen={isNewDeadlineOpen}
        onClose={() => setIsNewDeadlineOpen(false)}
      />

      <NewFlashcardModal
        isOpen={isNewFlashcardOpen}
        onClose={() => setIsNewFlashcardOpen(false)}
      />

      <NewScheduleModal
        isOpen={isNewScheduleOpen}
        onClose={() => setIsNewScheduleOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
