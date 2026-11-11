import React, { useState } from 'react';
import {
  Compass,
  Search,
  ExternalLink,
  Bookmark,
  Star,
  Clock,
  Video,
  FileText,
  Sliders,
  Code,
  Sparkles,
  HelpCircle,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CuratedResource, ResourceType } from '../../types';

export const ResourcesView: React.FC = () => {
  const { resources, subjects, selectedSubjectId, setSelectedSubjectId, requestResources, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [aiTopic, setAiTopic] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  const filtered = resources.filter(r => {
    if (selectedSubjectId && r.subjectId !== selectedSubjectId) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAIFind = async () => {
    if (!aiTopic.trim()) return;
    setIsFinding(true);
    const sub = subjects.find(s => s.id === selectedSubjectId);
    try {
      await requestResources(sub?.name || 'Computer Science', aiTopic);
      setAiTopic('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsFinding(false);
    }
  };

  const getBadgeForType = (type: ResourceType) => {
    switch (type) {
      case 'video_course':
        return { label: 'Video Course', icon: Video, color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'interactive_tool':
        return { label: 'Interactive Visualizer', icon: Sliders, color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' };
      case 'article_and_code':
        return { label: 'Article & Code', icon: Code, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
      case 'academic_notes':
        return { label: 'University Lecture Notes', icon: FileText, color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' };
      case 'practice_questions':
        return { label: 'Practice Problems (PYQs)', icon: HelpCircle, color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      default:
        return { label: 'Resource', icon: Compass, color: 'bg-neutral-800 text-neutral-300 border-neutral-700' };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            Curated High-Impact Study Resources
          </h2>
          <p className="text-xs text-neutral-400">
            NPTEL IIT lectures, MIT OCW, VisuAlgo sandboxes, and GATE Overflow problem archives
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-studio')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Resource Discovery</span>
        </button>
      </div>

      {/* AI Quick Recommendation Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            value={aiTopic}
            onChange={e => setAiTopic(e.target.value)}
            placeholder="Need help with a hard concept? Type topic (e.g. B+ Tree deletion, TCP Congestion Control)..."
            className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleAIFind}
          disabled={isFinding || !aiTopic.trim()}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
        >
          {isFinding ? 'Searching Repos & Portals...' : 'Recommend Best Materials'}
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedSubjectId === null
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            All Courses ({resources.length})
          </button>
          {subjects.map(s => {
            const isSelected = selectedSubjectId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(isSelected ? null : s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                  isSelected
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-white border-transparent'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.code}</span>
              </button>
            );
          })}
        </div>

        {/* Type select */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="video_course">Video Courses (NPTEL)</option>
            <option value="interactive_tool">Interactive Sandboxes</option>
            <option value="article_and_code">Code & Articles</option>
            <option value="academic_notes">Academic Books & Notes</option>
            <option value="practice_questions">GATE PYQs</option>
          </select>
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs">
            No resources match your filter. Use the AI search box above to discover fresh materials!
          </div>
        ) : (
          filtered.map(res => {
            const sub = subjects.find(s => s.id === res.subjectId);
            const badge = getBadgeForType(res.type);
            const Icon = badge.icon;

            return (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-neutral-900 hover:bg-neutral-850/80 border border-neutral-800 transition flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: sub?.color || '#6366F1' }}
                    >
                      {sub?.code || 'CS'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                      {res.title}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-400 mt-1">
                      {res.provider}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {res.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.estimatedHours}
                    </span>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-white transition"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
