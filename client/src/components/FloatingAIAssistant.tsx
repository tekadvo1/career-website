import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles, X, Send, Loader2, ChevronDown,
  RotateCcw, Copy, CheckCheck, Minimize2,
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ── Context chips per route ───────────────────────────────────────────────────
function getPageContext(pathname: string): { label: string; chips: string[] } {
  if (pathname.startsWith('/project-workspace'))
    return { label: 'Project Workspace', chips: ['Explain this task', 'Debug my code', "What should I do next?", 'Show me an example'] };
  if (pathname.startsWith('/role-analysis'))
    return { label: 'Role Analysis', chips: ['What skills should I learn first?', 'How do I break into this role?', 'What salary can I expect?'] };
  if (pathname.startsWith('/roadmap'))
    return { label: 'Learning Roadmap', chips: ['How long will this take?', 'Best free resources?', 'Which topic is most important?'] };
  if (pathname.startsWith('/tools') || pathname.startsWith('/project-structure'))
    return { label: 'Project Advisor', chips: ['Which tech stack should I pick?', 'Explain this folder structure', 'What is REST vs GraphQL?'] };
  if (pathname.startsWith('/dashboard'))
    return { label: 'Dashboard', chips: ['What project should I start?', 'How do I improve my profile?', 'What is my next step?'] };
  if (pathname.startsWith('/interview'))
    return { label: 'Interview Prep', chips: ['Give me a hard interview question', 'How do I answer behavioural questions?', 'What is STAR method?'] };
  if (pathname.startsWith('/tech-stack'))
    return { label: 'Tech Stack', chips: ['Compare React vs Vue', 'What is Node.js best for?', 'Explain Docker in simple terms'] };
  return { label: 'FindStreak AI', chips: ['How do I build a portfolio?', 'Best way to get my first dev job', "I'm stuck, help me"] };
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**'))
      return <p key={i} className="font-bold text-slate-900 mt-2 mb-0.5">{line.slice(2, -2)}</p>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} className="ml-3 list-disc text-slate-700">{line.slice(2)}</li>;
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    // inline bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-slate-700 leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j}>{p.slice(2, -2)}</strong>
            : p
        )}
      </p>
    );
  });
}

// ── Component ────────────────────────────────────────────────────────────────
export default function FloatingAIAssistant() {
  const location  = useLocation();
  const ctx       = getPageContext(location.pathname);
  const user      = getUser<{ name?: string; role?: string }>();

  // Don't render on landing / auth pages
  const hide = ['/', '/signin', '/signup', '/verify', '/forgot-password',
    '/reset-password', '/google-callback', '/onboarding',
    '/privacy', '/privacy-policy', '/cookies', '/cookie-policy',
    '/terms', '/terms-and-conditions', '/about', '/about-us',
    '/contact', '/contact-us', '/how-it-works',
  ].some(p => location.pathname === p || location.pathname.startsWith('/p/') || location.pathname.startsWith('/portfolio/') || location.pathname.startsWith('/admin'));

  const [open,      setOpen]      = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [msgs,      setMsgs]      = useState<Msg[]>([]);
  const [input,     setInput]     = useState('');
  const [typing,    setTyping]    = useState(false);
  const [copied,    setCopied]    = useState<string | null>(null);
  const [pulse,     setPulse]     = useState(true);   // draw attention on first load
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Stop pulsing after 4 s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimised) inputRef.current?.focus();
  }, [open, minimised]);

  // Reset conversation when page changes
  useEffect(() => {
    setMsgs([]);
  }, [location.pathname]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput('');

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: trimmed };
    setMsgs(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const role = (() => {
        try { return JSON.parse(sessionStorage.getItem('lastRoleAnalysis') || '{}').role || 'Software Engineer'; }
        catch { return 'Software Engineer'; }
      })();

      const res  = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmed,
          context: {
            type:        'career',
            currentPage: ctx.label,
            projectTitle: ctx.label,
            currentTask: trimmed.slice(0, 80),
          },
          role,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I couldn't get a response. Please try again.";
      setMsgs(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch {
      setMsgs(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "Network error — make sure the server is running and try again." }]);
    }
    setTyping(false);
  }, [typing, ctx.label]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (hide) return null;

  return (
    <>
      {/* ── Floating button ───────────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimised(false); }}
          aria-label="Open AI Assistant"
          className={`fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_8px_30px_rgba(16,185,129,0.45)] flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] ${pulse ? 'animate-bounce' : ''}`}
        >
          <Sparkles className="w-6 h-6" />
          {/* Pulse ring */}
          {pulse && (
            <span className="absolute inset-0 rounded-2xl bg-emerald-400 opacity-40 animate-ping" />
          )}
        </button>
      )}

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-[200] w-[360px] sm:w-[400px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            minimised ? 'h-[56px]' : 'h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center relative">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <p className="text-white font-bold text-[13px] leading-tight">AI Career Assistant</p>
                <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">{ctx.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {msgs.length > 0 && (
                <button onClick={() => setMsgs([])} title="Clear chat"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setMinimised(v => !v)} title={minimised ? 'Expand' : 'Minimise'}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                {minimised ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} title="Close"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 min-h-0">

                {/* Empty state */}
                {msgs.length === 0 && (
                  <div className="pt-2">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Hi{user?.name ? ` ${user.name.split(' ')[0]}` : ''}! Try asking:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ctx.chips.map(chip => (
                        <button key={chip} onClick={() => sendMessage(chip)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all leading-tight text-left">
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message bubbles */}
                {msgs.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-slate-500" />
                      </div>
                    )}
                    <div className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
                    }`}>
                      {m.role === 'assistant'
                        ? <div className="space-y-0.5">{renderContent(m.content)}</div>
                        : m.content
                      }
                      {m.role === 'assistant' && (
                        <button onClick={() => copyMsg(m.id, m.content)}
                          className="absolute -bottom-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-medium">
                          {copied === m.id ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copied === m.id ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5 items-center">
                        {[0, 150, 300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick chip suggestions (after first message) */}
              {msgs.length > 0 && msgs.length < 4 && (
                <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 bg-white flex-shrink-0">
                  {ctx.chips.slice(0, 3).map(chip => (
                    <button key={chip} onClick={() => sendMessage(chip)}
                      className="whitespace-nowrap px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex-shrink-0">
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask anything about your career..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[13px] text-slate-800 placeholder-slate-400 outline-none leading-relaxed max-h-24 min-h-[24px]"
                    style={{ height: 'auto' }}
                    onInput={e => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.min(t.scrollHeight, 96) + 'px';
                    }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || typing}
                    className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
                  >
                    {typing
                      ? <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                      : <Send className="w-3.5 h-3.5 text-white" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
