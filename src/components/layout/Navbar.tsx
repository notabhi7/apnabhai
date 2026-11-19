import React, { useState } from 'react';
import {
  Sun,
  Moon,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Library,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudy } from '../../context/StudyContext';
import { PageView } from '../../types';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { activePage, setActivePage } = useStudy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks: { id: PageView; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ai-tutor', label: 'AI Tutor' },
    { id: 'quiz-generator', label: 'Quizzes' },
    { id: 'revision-notes', label: 'Notes' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'ai-concepts', label: 'AI Concepts' },
    { id: '3d-lab', label: '3D Lab' },
    { id: 'analytics-studio', label: 'Analytics' },
    { id: 'study-library', label: 'Library' },
  ];

  const handleNavClick = (page: PageView) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors bg-white/95 dark:bg-slate-950/90 border-zinc-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo */}
        <button
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-950 dark:bg-white p-0.5 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/assets/aistudio/image_e3bbf901.png"
              alt="ApnaBhai Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-zinc-950 dark:text-white whitespace-nowrap">
            ApnaBhai
          </span>
        </button>

        {/* Zone 2: Minimalist Clean Typography Navigation */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map(link => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white'
                    : 'text-zinc-500 dark:text-slate-400 border-transparent hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-zinc-100/80 dark:bg-slate-900 hover:bg-zinc-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <img
                  src={user.avatarUrl || '/assets/aistudio/image_e3bbf901.png'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="text-xs font-semibold text-zinc-900 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-zinc-950 dark:text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActivePage('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Workspace Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setActivePage('profile-settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setActivePage('study-library');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Library className="w-3.5 h-3.5" />
                      <span>Saved Library</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-zinc-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-700 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {navLinks.map(link => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
