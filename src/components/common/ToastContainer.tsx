import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStudy();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/30'
                : isError
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/30'
                : 'bg-slate-900/95 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
