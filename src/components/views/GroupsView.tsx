import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Share2,
  Video,
  Send,
  Plus,
  BookOpen,
  Code2,
  Sparkles,
  CheckCircle,
  Hash,
  Paperclip
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyGroup, GroupMessage } from '../../types';

export const GroupsView: React.FC = () => {
  const { studyGroups, sendMessageToGroup, notes, setActiveTab } = useApp();

  const [activeGroupId, setActiveGroupId] = useState<string>(studyGroups[0]?.id || 'grp-dsa');
  const [inputText, setInputText] = useState('');
  const [selectedNoteIdToShare, setSelectedNoteIdToShare] = useState<string>('');
  const [showNotePicker, setShowNotePicker] = useState(false);

  const activeGroup = studyGroups.find(g => g.id === activeGroupId) || studyGroups[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedNoteIdToShare) return;

    let noteSnippet: string | undefined = undefined;
    if (selectedNoteIdToShare) {
      const foundNote = notes.find(n => n.id === selectedNoteIdToShare);
      if (foundNote) {
        noteSnippet = `[Shared Note: ${foundNote.title}] - ${foundNote.summary || foundNote.content.slice(0, 150)}...`;
      }
    }

    sendMessageToGroup(activeGroup.id, inputText.trim(), noteSnippet);
    setInputText('');
    setSelectedNoteIdToShare('');
    setShowNotePicker(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Social Study Groups & Peer Circles
          </h2>
          <p className="text-xs text-neutral-400">
            Collaborate on lab assignments, share high-yield lecture notes, and join peer review calls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeGroup?.meetLink && (
            <a
              href={activeGroup.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Live Study Room</span>
            </a>
          )}
        </div>
      </div>

      {/* 2-Pane Chat & Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column: Group Channels list (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-2">
            Joined B.Tech Circles ({studyGroups.length})
          </div>

          {studyGroups.map(grp => {
            const isSelected = activeGroup?.id === grp.id;
            return (
              <div
                key={grp.id}
                onClick={() => setActiveGroupId(grp.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition text-left space-y-1.5 ${
                  isSelected
                    ? 'bg-neutral-850 border-emerald-500/50 shadow-md'
                    : 'bg-neutral-900 hover:bg-neutral-850/80 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {grp.subjectCode}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">
                      {grp.name}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {grp.activeNow} online
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2">
                  {grp.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                  <span>{grp.membersCount} members</span>
                  <span>{grp.sharedNotesCount} shared notes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Chat Room & Messages (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden min-h-[580px]">
          {/* Room Header */}
          <div className="p-4 bg-neutral-850/90 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">{activeGroup.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {activeGroup.subjectCode}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">{activeGroup.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 hidden sm:inline">
                {activeGroup.activeNow} classmates active
              </span>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto max-h-[460px]">
            {activeGroup.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full ring-2 ring-neutral-700 object-cover flex-shrink-0"
                />

                <div className={`space-y-1 max-w-[80%] ${msg.isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="font-bold text-neutral-200">{msg.senderName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      {msg.senderRole}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left ${
                      msg.isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-neutral-850 text-neutral-200 border border-neutral-800 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Shared note attachment if present */}
                    {msg.noteSnippet && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-700/60 text-[11px] text-emerald-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-white">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Attached Peer Note</span>
                        </div>
                        <p className="text-neutral-300 font-sans italic">{msg.noteSnippet}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Share Note Picker Dropdown */}
          {showNotePicker && (
            <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <select
                value={selectedNoteIdToShare}
                onChange={e => setSelectedNoteIdToShare(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none"
              >
                <option value="">-- Select a lecture note from your vault to share --</option>
                {notes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title} ({n.topic})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-neutral-850 border-t border-neutral-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowNotePicker(!showNotePicker)}
              className={`p-2 rounded-xl text-xs transition flex items-center gap-1 ${
                showNotePicker
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Attach a lecture note"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Message #${activeGroup.name}...`}
              className="flex-1 px-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedNoteIdToShare}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
