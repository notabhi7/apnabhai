import React from 'react';
import { useStudy } from '../../context/StudyContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useStudy();

  return (
    <footer className="border-t bg-white dark:bg-slate-950 border-zinc-100 dark:border-slate-800/80 text-zinc-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <button
              onClick={() => setActivePage('landing')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-950 dark:bg-white p-0.5 flex items-center justify-center">
                <img
                  src="/assets/aistudio/image_e3bbf901.png"
                  alt="ApnaBhai"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-white tracking-tight">
                ApnaBhai
              </span>
            </button>
            <p className="text-xs text-zinc-500 dark:text-slate-400 leading-relaxed max-w-xs">
              AI-powered academic workspace for concept explanations, adaptive quizzes, structured notes, and active recall.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold text-zinc-950 dark:text-white">
              Study Tools
            </div>
            <ul className="space-y-2 text-zinc-500 dark:text-slate-400">
              <li>
                <button onClick={() => setActivePage('ai-tutor')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Concept Explainer & Tutor
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('quiz-generator')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Adaptive Quiz Generator
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('revision-notes')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Structured Revision Notes
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('flashcards')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Active Recall Flashcards
                </button>
              </li>
            </ul>
          </div>

          {/* AI & Spatial */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold text-zinc-950 dark:text-white">
              AI & Spatial Lab
            </div>
            <ul className="space-y-2 text-zinc-500 dark:text-slate-400">
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Prompt Engineering & LLMs
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Zero-Shot vs Few-Shot
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('3d-lab')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  3D Neural Knowledge Core
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('study-library')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">
                  Personal Study Library
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Note */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-zinc-950 dark:text-white">
              Academic Integrity
            </div>
            <p className="text-xs text-zinc-500 dark:text-slate-400 leading-relaxed">
              ApnaBhai assists with structured learning and exam revision. Verify critical formulas and dates against official course syllabi.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} ApnaBhai
          </div>
          <div className="flex items-center gap-3">
            <span>Firebase Cloud Sync</span>
            <span aria-hidden="true">·</span>
            <span>Active Recall Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
