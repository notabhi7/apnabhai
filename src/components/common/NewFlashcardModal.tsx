import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewFlashcardModal: React.FC<NewFlashcardModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addFlashcardsBatch } = useApp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [tag, setTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    const sub = subjects.find(s => s.id === subjectId);

    addFlashcardsBatch([
      {
        subjectId,
        topic: topic.trim() || 'Core Concept',
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || undefined,
        masteryLevel: 0,
        tag: tag.trim() || sub?.code || 'CS'
      }
    ]);

    onClose();
  };

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
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Add Recall Flashcard</h3>
            <p className="text-xs text-neutral-400">Card for definitions, formulas, and proofs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                Topic Tag
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Graph Theory"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Front: Problem / Question *
            </label>
            <textarea
              required
              rows={3}
              value={front}
              onChange={e => setFront(e.target.value)}
              placeholder="e.g. What is the Master Theorem condition for T(n) = 2T(n/2) + O(n log n)?"
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Back: Answer / Proof / Explanation *
            </label>
            <textarea
              required
              rows={4}
              value={back}
              onChange={e => setBack(e.target.value)}
              placeholder="e.g. By Extended Master Theorem Case 2b, since f(n) = Θ(n log n), T(n) = Θ(n log² n)."
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Mnemonic / Hint (Optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={e => setHint(e.target.value)}
              placeholder="e.g. Extra log factor increases exponent of log"
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30 transition"
            >
              Add to Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
