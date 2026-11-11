import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Sparkles,
  Layers,
  HelpCircle,
  Compass,
  Users,
  BarChart3,
  Settings,
  Plus,
  BookMarked,
  Cpu,
  Binary,
  Database,
  Network,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useApp, AppTab } from '../../context/AppContext';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNewSubject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  onOpenNewSubject
}) => {
  const {
    activeTab,
    setActiveTab,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    deadlines,
    notes,
    flashcards
  } = useApp();

  const navItems = [
    {
      id: 'dashboard' as AppTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'notes' as AppTab,
      label: 'Lecture Notes',
      icon: BookOpen,
      badge: notes.length
    },
    {
      id: 'deadlines' as AppTab,
      label: 'Deadlines & Exams',
      icon: CalendarCheck,
      badge: deadlines.filter(d => d.status !== 'completed').length,
      badgeColor: 'bg-rose-500/20 text-rose-300'
    },
    {
      id: 'schedule' as AppTab,
      label: 'Study Timetable',
      icon: CalendarClock,
      badge: null
    },
    {
      id: 'ai-studio' as AppTab,
      label: 'AI Learning Studio',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'flashcards' as AppTab,
      label: 'Flashcards Mastery',
      icon: Layers,
      badge: flashcards.length
    },
    {
      id: 'quiz' as AppTab,
      label: 'Exam Quizzes',
      icon: HelpCircle,
      badge: 'GATE'
    },
    {
      id: 'resources' as AppTab,
      label: 'Curated Resources',
      icon: Compass,
      badge: null
    },
    {
      id: 'groups' as AppTab,
      label: 'Social Study Groups',
      icon: Users,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'analytics' as AppTab,
      label: 'Performance Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as AppTab,
      label: 'Sync & Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[57px] bottom-0 left-0 z-40 w-64 h-screen md:h-[calc(100vh-57px)] flex flex-col justify-between border-r border-neutral-800 bg-neutral-900/95 backdrop-blur-xl transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/25 font-semibold'
                        : item.highlight
                        ? 'bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-fuchsia-500/15 text-rose-300 hover:bg-neutral-800/80 border border-rose-500/30'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-rose-400' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : item.badgeColor || 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Subjects Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Enrolled Subjects
              </span>
              <button
                onClick={onOpenNewSubject}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Add New Engineering Course"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubjectId(null)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                  selectedSubjectId === null
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>All Subjects</span>
                </div>
                <span className="text-[10px] text-neutral-400">{notes.length} notes</span>
              </button>

              {subjects.map(sub => {
                const isSelected = selectedSubjectId === sub.id;
                const subNotesCount = notes.filter(n => n.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      if (activeTab === 'dashboard') setActiveTab('notes');
                    }}
                    className={`w-full flex flex-col px-3 py-2 rounded-xl text-left transition ${
                      isSelected
                        ? 'bg-neutral-800 text-white ring-1 ring-neutral-700'
                        : 'text-neutral-300 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="text-xs font-semibold truncate">{sub.code}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">{sub.syllabusProgress}%</span>
                    </div>

                    <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {sub.name}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-neutral-800 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${sub.syllabusProgress}%`,
                          backgroundColor: sub.color
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer info with apnabhai mascot */}
        <div className="p-3 border-t border-rose-950/40 bg-neutral-950/60">
          <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-rose-500/20 text-[11px] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 p-0.5 border border-rose-500/30 flex-shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/image_e3bbf901.png"
                alt="apnabhai mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-neutral-200 font-bold">
                <span className="truncate">apnabhai B.Tech</span>
                <span className="text-rose-400 font-extrabold text-[10px]">Sem 4</span>
              </div>
              <p className="text-rose-200/60 text-[10px] mt-0.5 truncate">
                7 days to Mid-Terms • Study hard!
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
