import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/modals/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

// Page Views
import { LandingPage } from './components/views/LandingPage';
import { DashboardView } from './components/views/DashboardView';
import { AITutorView } from './components/views/AITutorView';
import { QuizGeneratorView } from './components/views/QuizGeneratorView';
import { RevisionNotesView } from './components/views/RevisionNotesView';
import { FlashcardsView } from './components/views/FlashcardsView';
import { AIConceptsView } from './components/views/AIConceptsView';
import { StudyLibraryView } from './components/views/StudyLibraryView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';

const MainWorkspace: React.FC = () => {
  const { activePage, setActivePage } = useStudy();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      setActivePage('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'dashboard':
        return <DashboardView />;
      case 'ai-tutor':
        return <AITutorView />;
      case 'quiz-generator':
        return <QuizGeneratorView />;
      case 'revision-notes':
        return <RevisionNotesView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'ai-concepts':
        return <AIConceptsView />;
      case 'study-library':
        return <StudyLibraryView />;
      case 'profile-settings':
        return <ProfileSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {renderActiveView()}
      </main>

      {/* Educational Platform Footer */}
      <Footer />

      {/* Auth Modal (Login / Signup / Guest) */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StudyProvider>
          <MainWorkspace />
        </StudyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
