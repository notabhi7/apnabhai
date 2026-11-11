import React, { useState } from 'react';
import { X, CalendarClock, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewScheduleModal: React.FC<NewScheduleModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addScheduleItem } = useApp();

  const [day, setDay] = useState('Monday');
  const [timeBlock, setTimeBlock] = useState('08:00 AM - 09:30 AM');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [focusTopic, setFocusTopic] = useState('');
  const [sessionType, setSessionType] = useState('Active Problem Solving');
  const [difficulty, setDifficulty] = useState<'High' | 'Medium' | 'Low'>('Medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusTopic.trim()) return;

    addScheduleItem({
      day,
      timeBlock,
      subjectId,
      focusTopic: focusTopic.trim(),
      sessionType,
      difficulty,
      completed: false
    });

    onClose();
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Add Study Timetable Block</h3>
            <p className="text-xs text-neutral-400">Plan high-yield study and derivation sprints</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Day of Week *
              </label>
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
              >
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Time Block *
              </label>
              <input
                type="text"
                value={timeBlock}
                onChange={e => setTimeBlock(e.target.value)}
                placeholder="e.g. 05:00 PM - 06:30 PM"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Course Subject *
            </label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
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
              Focus Topic *
            </label>
            <input
              type="text"
              required
              value={focusTopic}
              onChange={e => setFocusTopic(e.target.value)}
              placeholder="e.g. BCNF Normalization & Dependency Preservation"
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
              >
                <option value="Active Problem Solving">Active Problem Solving</option>
                <option value="Theory & Derivation">Theory & Derivation</option>
                <option value="Lab Coding & Practice">Lab Coding & Practice</option>
                <option value="Flashcard Drill">Flashcard Drill</option>
                <option value="Mock Test & PYQ Review">Mock Test & PYQ Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Add Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
