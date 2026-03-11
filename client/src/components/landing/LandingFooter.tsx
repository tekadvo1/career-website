import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

const links = [
  { label: 'Home', path: '/' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'About', path: '/about-us' },
  { label: 'Contact', path: '/contact-us' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Cookies', path: '/cookies' },
  { label: 'Terms', path: '/terms' },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/30">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-teal-900/50 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">FindStreak</span>
          </button>

          {/* Nav links */}
          <nav className="flex items-center gap-5 flex-wrap justify-center">
            {links.map(l => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="text-sm text-slate-500 hover:text-teal-400 transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-600 flex-shrink-0">© {year} FindStreak.</p>
        </div>

        {/* Bottom line */}
        <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            By using FindStreak you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-slate-500 hover:text-teal-400 underline underline-offset-2 transition-colors">Terms &amp; Conditions</button>,{' '}
            <button onClick={() => navigate('/privacy')} className="text-slate-500 hover:text-teal-400 underline underline-offset-2 transition-colors">Privacy Policy</button> and{' '}
            <button onClick={() => navigate('/cookies')} className="text-slate-500 hover:text-teal-400 underline underline-offset-2 transition-colors">Cookie Policy</button>.
          </p>
        </div>
      </div>
    </footer>
  );
}
