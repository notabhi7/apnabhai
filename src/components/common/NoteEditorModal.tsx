import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, Code2, Tag, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LectureNote } from '../../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: LectureNote | null;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  noteToEdit
}) => {
  const { subjects, addNote, updateNote, requestSummary } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [moduleNumber, setModuleNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [codeContent, setCodeContent] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setSubjectId(noteToEdit.subjectId);
      setTopic(noteToEdit.topic);
      setModuleNumber(noteToEdit.moduleNumber);
      setDifficulty(noteToEdit.difficulty);
      setContent(noteToEdit.content);
      setTagsInput(noteToEdit.tags.join(', '));
      if (noteToEdit.codeSnippet) {
        setIncludeCode(true);
        setCodeLanguage(noteToEdit.codeSnippet.language);
        setCodeContent(noteToEdit.codeSnippet.code);
      } else {
        setIncludeCode(false);
        setCodeContent('');
      }
    } else {
      setTitle('');
      setTopic('');
      setModuleNumber(1);
      setDifficulty('Medium');
      setContent('');
      setTagsInput('');
      setIncludeCode(false);
      setCodeContent('');
    }
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const codeSnippet = includeCode && codeContent.trim()
      ? { language: codeLanguage, code: codeContent.trim() }
      : undefined;

    try {
      if (noteToEdit) {
        updateNote(noteToEdit.id, {
          title: title.trim(),
          subjectId,
          topic: topic.trim() || title.trim(),
          moduleNumber,
          difficulty,
          content: content.trim(),
          tags,
          codeSnippet
        });
      } else {
        const createdNote = addNote({
          title: title.trim(),
          subjectId,
          topic: topic.trim() || title.trim(),
          moduleNumber,
          difficulty,
          content: content.trim(),
          tags,
          bookmarked: false,
          codeSnippet
        });

        if (autoSummarize) {
          // Trigger AI summary in background
          requestSummary(createdNote).catch(() => {});
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {noteToEdit ? 'Edit Lecture Note' : 'Create New Lecture Note'}
            </h3>
            <p className="text-xs text-neutral-400">
              Record classroom lectures, derivations, and lab observations
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Lecture Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Dijkstra's Algorithm & Fibonacci Heap Optimization"
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Course Subject *
              </label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Topic / Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Graph Algorithms"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Module
                </label>
                <select
                  value={moduleNumber}
                  onChange={e => setModuleNumber(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(m => (
                    <option key={m} value={m}>
                      Mod {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-2 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Lecture Content & Theory *
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste classroom lecture notes, theorem statements, proof sketches, and professor's key remarks..."
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Code snippet toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Include Implementation Code (Optional)
              </label>
              <button
                type="button"
                onClick={() => setIncludeCode(!includeCode)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                {includeCode ? 'Remove Code Block' : '+ Add Code Snippet'}
              </button>
            </div>

            {includeCode && (
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Language:</span>
                  <select
                    value={codeLanguage}
                    onChange={e => setCodeLanguage(e.target.value)}
                    className="px-2 py-1 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                  >
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={codeContent}
                  onChange={e => setCodeContent(e.target.value)}
                  placeholder="// Paste runnable code implementation..."
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-400 font-mono focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Graphs, Greedy, GATE-Priority, Lab-Test"
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!noteToEdit && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Auto-generate High-Yield Exam Cheatsheet with Gemini
              </span>
              <input
                type="checkbox"
                checked={autoSummarize}
                onChange={e => setAutoSummarize(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : noteToEdit ? 'Save Changes' : 'Create Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
