import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  Brain,
  Award,
  Code2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  model?: string;
  isError?: boolean;
  timestamp: string;
}

type ChatbotModelId =
  | 'gemini-4-hydrogen'
  | 'gemini-4-hydrogen-deep'
  | 'gemini-4-hydrogen-fast'
  | 'gemini-3.1-flash-lite';

export const GeminiChatbotDrawer: React.FC = () => {
  const { firebaseUser, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Model & Persona State
  const [selectedModel, setSelectedModel] = useState<ChatbotModelId>('gemini-4-hydrogen');
  const [selectedPersona, setSelectedPersona] = useState<'socratic' | 'drillmaster' | 'eli5' | 'architect'>('socratic');

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('apnabhai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse chat history', e);
    }
    return [
      {
        id: 'msg-init-1',
        role: 'model',
        text: "Namaste! I'm your **ApnaBhai Gemini AI Study Companion**. How can I help you conquer difficult concepts today? Pick a coach persona or ask me anything!",
        model: 'gemini-4-hydrogen',
        timestamp: 'Just now'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('apnabhai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Chat storage save warning', e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    // Filter out prior error bubbles before sending conversation history to server
    const validHistoryForApi = nextMessages.filter(m => !m.isError);

    setMessages(nextMessages);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: validHistoryForApi,
          role: selectedPersona,
          model: selectedModel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: 'model',
          text: data?.error || `Request failed (${res.status}). Please try again in a moment.`,
          model: selectedModel,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errMsg]);
        return;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Let us break this concept down step-by-step.',
        model: data.model || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      // Sync to Firestore if authenticated
      if (firebaseUser) {
        try {
          await addDoc(collection(db, 'chat_messages'), {
            userId: firebaseUser.uid,
            role: 'user',
            content: textToSend.trim(),
            model: selectedModel,
            systemRole: selectedPersona,
            timestamp: new Date().toISOString()
          });
          await addDoc(collection(db, 'chat_messages'), {
            userId: firebaseUser.uid,
            role: 'model',
            content: botMsg.text,
            model: botMsg.model,
            systemRole: selectedPersona,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Firestore chat sync skipped', e);
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: e?.message || 'Connection to the AI tutor failed. Please verify the server is running and try again.',
          model: selectedModel,
          isError: true,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    const fresh: Message[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: `Fresh session started with **${selectedPersona.toUpperCase()}** coach using **${selectedModel}**. What topic are we mastering?`,
        model: selectedModel,
        timestamp: 'Just now'
      }
    ];
    setMessages(fresh);
  };

  const suggestions = [
    'Explain Zero-Shot vs Few-Shot learning',
    'Why do LLMs hallucinate?',
    "Step-by-step guide to Dijkstra's algorithm",
    'ELI5: Transformer Attention Mechanism'
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Open AI Study Assistant"
        >
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white/25 p-0.5">
            <img
              src="/assets/aistudio/image_e3bbf901.png"
              alt="ApnaBhai"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-100">Gemini Powered</div>
            <div className="text-xs font-bold leading-none">Ask ApnaBhai AI</div>
          </div>
        </button>
      )}

      {/* Slide-over / Modal Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 shadow-2xl transition-all duration-300 ${
            isExpanded
              ? 'inset-3 sm:inset-6 rounded-3xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-indigo-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-indigo-50/70 to-violet-50 dark:from-slate-950/90 dark:to-slate-950/90 rounded-t-3xl backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <img
                  src="/assets/aistudio/image_e3bbf901.png"
                  alt="ApnaBhai"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    ApnaBhai AI Tutor
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    · Ready
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Multi-Turn Gemini Reasoning</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title="Restart Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model & Persona Selection Bar */}
          <div className="p-2.5 border-b border-indigo-100/80 dark:border-slate-800/80 bg-sky-50/40 dark:bg-slate-950/40 space-y-2 text-xs">
            {/* Model Selector */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Model:</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'gemini-4-hydrogen', label: 'Hydrogen 4' },
                    { id: 'gemini-4-hydrogen-deep', label: 'Deep Think' },
                    { id: 'gemini-4-hydrogen-fast', label: 'Fast' },
                    { id: 'gemini-3.1-flash-lite', label: 'Lite 3.1' }
                  ] as const
                ).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedModel === m.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Persona:</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'socratic', label: 'Socratic', icon: Brain },
                    { id: 'drillmaster', label: 'Drillmaster', icon: Award },
                    { id: 'eli5', label: 'ELI5', icon: Sparkles },
                    { id: 'architect', label: 'Architect', icon: Code2 }
                  ] as const
                ).map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedPersona === p.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-white dark:bg-slate-900">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className={`w-7 h-7 rounded-lg p-0.5 shrink-0 flex items-center justify-center ${msg.isError ? 'bg-rose-500' : 'bg-gradient-to-tr from-sky-500 to-indigo-600'}`}>
                    {msg.isError ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <img
                        src="/assets/aistudio/image_e3bbf901.png"
                        alt="ApnaBhai"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-xs shadow-sm'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-indigo-100 dark:border-slate-700/60 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className={`flex items-center justify-between gap-3 text-[10px] mb-0.5 ${msg.role === 'user' ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span className="font-semibold">{msg.role === 'user' ? (user?.name || 'You') : 'ApnaBhai AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>

                  {msg.role === 'model' && !msg.isError && (
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-[9px]">{msg.model || selectedModel}</span>
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-800 dark:hover:text-white rounded transition cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-sky-700 dark:text-slate-200" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs py-2 pl-9 font-medium">
                <span>ApnaBhai is thinking with {selectedModel}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length <= 3 && (
            <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-indigo-100/80 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-950/30">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-slate-200 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask as ${selectedPersona}... (e.g. "Explain with an analogy")`}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-sky-50/50 dark:bg-slate-950 border border-indigo-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 transition cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-1 text-[9px] text-center text-slate-500 dark:text-slate-400">
              ApnaBhai AI may make mistakes. Verify critical exam facts with trusted academic references.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
