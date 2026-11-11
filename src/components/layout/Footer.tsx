import React from 'react';
import { Shield } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useStudy();

  return (
    <footer className="border-t bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex items-center justify-center">
                <img
                  src="/assets/aistudio/image_e3bbf901.png"
                  alt="AI Study Buddy"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                AI Study Buddy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Personalized concept explanations, adaptive quizzes, and active recall flashcards.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Study Tools
            </div>
            <ul className="space-y-1 text-slate-500">
              <li>
                <button onClick={() => setActivePage('ai-tutor')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Concept Explainer & Tutor
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('quiz-generator')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Adaptive Quiz Generator
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('revision-notes')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Structured Revision Notes
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('flashcards')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Active Recall Flashcards
                </button>
              </li>
            </ul>
          </div>

          {/* AI Masterclass */}
          <div className="space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              AI Concepts
            </div>
            <ul className="space-y-1 text-slate-500">
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Prompt Engineering
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Large Language Models
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Zero-Shot vs Few-Shot
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ai-concepts')} className="hover:text-blue-600 dark:hover:text-blue-400">
                  AI Hallucination Mitigation
                </button>
              </li>
            </ul>
          </div>

          {/* Integrity Note */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 text-[11px]">
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Academic Integrity</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              AI Study Buddy assists in study synthesis. Verify critical formulas and examination dates with certified university references.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} AI Study Buddy.
          </div>
          <div className="flex items-center gap-3">
            <span>SSL Secured</span>
            <span>•</span>
            <span>Active Recall Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
