import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  Edit3,
  Bookmark,
  Trash2,
  RefreshCw,
  FileText,
  Code,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { RevisionNote } from '../../types';

export const RevisionNotesView: React.FC = () => {
  const {
    currentNote,
    savedNotes,
    isGeneratingNotes,
    generateNotes,
    updateNote,
    setCurrentNote,
    deleteNote,
    showToast
  } = useStudy();

  const [topicInput, setTopicInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('Computer Science & AI');
  const [detailLevel, setDetailLevel] = useState('Comprehensive');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const [editOverview, setEditOverview] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const sampleTopics = [
    'Transformer Attention',
    'Database ACID Properties',
    'Virtual Memory & Paging',
    'CNN Architectures',
    'Prompt Directives'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || isGeneratingNotes) return;
    setIsEditing(false);
    const note = await generateNotes(topicInput.trim(), detailLevel, subjectInput);
    if (note) {
      setEditOverview(note.overview);
      setEditSummary(note.summary);
    }
  };

  const handleSelectSample = (sample: string) => {
    setTopicInput(sample);
    setIsEditing(false);
    generateNotes(sample, detailLevel, subjectInput).then(note => {
      if (note) {
        setEditOverview(note.overview);
        setEditSummary(note.summary);
      }
    });
  };

  const handleSelectSavedNote = (note: RevisionNote) => {
    setCurrentNote(note);
    setEditOverview(note.overview);
    setEditSummary(note.summary);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!currentNote) return;
    setEditOverview(currentNote.overview);
    setEditSummary(currentNote.summary);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      overview: editOverview,
      summary: editSummary
    });
    setIsEditing(false);
  };

  const formatAsMarkdown = (note: RevisionNote): string => {
    let md = `# ${note.title || note.topic}\n\n`;
    md += `**Subject:** ${note.subject} | **Detail:** ${note.detailLevel}\n\n`;
    md += `## Overview\n${note.overview}\n\n`;

    if (note.sections && note.sections.length > 0) {
      md += `## Core Concepts\n`;
      note.sections.forEach(s => {
        md += `### ${s.heading}\n${s.content}\n\n`;
      });
    }

    if (note.keyDefinitions && note.keyDefinitions.length > 0) {
      md += `## Definitions\n`;
      note.keyDefinitions.forEach(d => {
        md += `- **${d.term}:** ${d.definition}\n`;
      });
      md += `\n`;
    }

    if (note.formulasAndTheorems && note.formulasAndTheorems.length > 0) {
      md += `## Formulas & Invariants\n`;
      note.formulasAndTheorems.forEach(f => {
        md += `\`\`\`\n${f}\n\`\`\`\n\n`;
      });
    }

    if (note.examQuickTips && note.examQuickTips.length > 0) {
      md += `## High-Yield Exam Tips\n`;
      note.examQuickTips.forEach(tip => {
        md += `- ⚡ ${tip}\n`;
      });
      md += `\n`;
    }

    md += `## Summary\n${note.summary}\n`;
    return md;
  };

  const handleCopyMarkdown = () => {
    if (!currentNote) return;
    const md = formatAsMarkdown(currentNote);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    showToast('Markdown copied to clipboard!', 'info');
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!currentNote) return;
    const md = formatAsMarkdown(currentNote);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentNote.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded .md file!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Notes Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Revision Notes & Cheatsheets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured study guides with definitions, formulas, and Markdown export.
          </p>
        </div>

        {currentNote && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Config Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Enter lecture topic (e.g. Memory Hierarchy, Transformers & Attention, CNNs)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isGeneratingNotes || !topicInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingNotes ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Subject:</span>
              <select
                value={subjectInput}
                onChange={e => setSubjectInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-violet-500"
              >
                <option value="Computer Science & AI">Computer Science & AI</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Operating Systems & Networks">Operating Systems & Networks</option>
                <option value="Mathematics & Statistics">Mathematics & Statistics</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Format:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
                {['Comprehensive', 'Cheat Sheet', 'Cram Guide'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDetailLevel(lvl)}
                    className={`py-1 text-xs font-semibold rounded-lg transition ${
                      detailLevel === lvl
                        ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Suggestions:</span>
          {sampleTopics.map(sample => (
            <button
              key={sample}
              onClick={() => handleSelectSample(sample)}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200/80 dark:border-slate-700/80 transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Main Document Content */}
      {isGeneratingNotes ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Synthesizing Revision Guide...
          </h3>
          <p className="text-xs text-slate-400">
            Extracting definitions, formulas, and high-yield exam tips.
          </p>
        </div>
      ) : currentNote ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Document (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
              {/* Document Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800">
                      {currentNote.subject}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{currentNote.detailLevel}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentNote.title || currentNote.topic}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Executive Overview
                </h3>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editOverview}
                    onChange={e => setEditOverview(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-violet-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentNote.overview}
                  </p>
                )}
              </div>

              {/* Key Definitions */}
              {currentNote.keyDefinitions?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-violet-500" />
                    <span>Essential Terminology</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentNote.keyDefinitions.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-0.5 text-xs"
                      >
                        <span className="font-bold text-violet-700 dark:text-violet-400">
                          {def.term}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Content */}
              {currentNote.sections?.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 pt-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{sec.heading}</span>
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {sec.content}
                  </div>
                </div>
              ))}

              {/* Formulas */}
              {currentNote.formulasAndTheorems && currentNote.formulasAndTheorems.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-500" />
                    <span>Key Formulas</span>
                  </h3>
                  <div className="space-y-1.5">
                    {currentNote.formulasAndTheorems.map((f, idx) => (
                      <pre
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed"
                      >
                        <code>{f}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* High-Yield Exam Tips */}
              {currentNote.examQuickTips && currentNote.examQuickTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Exam Tips</span>
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
                    {currentNote.examQuickTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">⚡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="space-y-1 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Synthesis
                </h3>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editSummary}
                    onChange={e => setEditSummary(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-violet-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentNote.summary}
                  </p>
                )}
              </div>

              {/* Trust Tag */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                <span>AI Study Guide • Verify critical values with course textbooks</span>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Guides (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Saved Notes
                </span>
                <span className="text-slate-400">{savedNotes.length} Total</span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {savedNotes.length > 0 ? (
                  savedNotes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleSelectSavedNote(n)}
                      className={`p-3 rounded-2xl border cursor-pointer transition space-y-0.5 text-xs group ${
                        currentNote.id === n.id
                          ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-700 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-900 dark:text-white">
                        <span className="truncate max-w-[160px]">{n.title || n.topic}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{n.subject}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No notes saved yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Generate Structured Notes
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Input a concept to generate an editable, downloadable Markdown cheatsheet.
          </p>
        </div>
      )}
    </div>
  );
};
