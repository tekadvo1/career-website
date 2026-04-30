import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FloatingAIAssistant from './FloatingAIAssistant';
import FeedbackWidget from './FeedbackWidget';

// Pages where the dock should NOT appear at all
const HIDDEN_PATHS = [
  '/', '/signin', '/signup', '/verify', '/forgot-password',
  '/reset-password', '/google-callback', '/onboarding',
  '/privacy', '/privacy-policy', '/cookies', '/cookie-policy',
  '/terms', '/terms-and-conditions', '/about', '/about-us',
  '/contact', '/contact-us', '/how-it-works',
];

export default function WidgetDock() {
  const location = useLocation();
  const [visible,  setVisible]  = useState(true);   // both widgets shown/hidden
  const [chatOpen, setChatOpen] = useState(false);  // AI chat panel open

  const isHidden = HIDDEN_PATHS.some(p => location.pathname === p)
    || location.pathname.startsWith('/p/')
    || location.pathname.startsWith('/portfolio/')
    || location.pathname.startsWith('/admin');

  if (isHidden) return null;

  return (
    <>
      {/* ── Dark backdrop when chat is open ──────────────────────────────── */}
      {chatOpen && visible && (
        <div
          className="fixed inset-0 bg-black/30 z-[250] backdrop-blur-[2px] transition-opacity"
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* ── Single toggle tab — always visible on the right edge ─────────── */}
      <button
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide widgets' : 'Show widgets'}
        title={visible ? 'Hide buttons' : 'Show buttons'}
        className="fixed right-0 bottom-32 z-[400] flex items-center justify-center w-6 h-12 bg-slate-800 hover:bg-emerald-600 text-white rounded-l-xl shadow-lg transition-all group"
      >
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform duration-300 ${visible ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* ── Both widgets — hidden/shown together via the toggle ───────────── */}
      <div
        className={`transition-all duration-300 ${
          visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <FloatingAIAssistant onOpenChange={setChatOpen} />
        <FeedbackWidget />
      </div>
    </>
  );
}
