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
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-900/20 group-hover:shadow-teal-900/40 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-black text-lg tracking-tight">FindStreak</span>
          </button>

          {/* Nav links */}
          <nav className="flex items-center gap-5 flex-wrap justify-center">
            {links.map(l => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-400 flex-shrink-0">© {year} FindStreak.</p>
        </div>

        {/* Bottom line */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By using FindStreak you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-slate-600 font-medium hover:text-teal-600 underline underline-offset-2 transition-colors">Terms &amp; Conditions</button>,{' '}
            <button onClick={() => navigate('/privacy')} className="text-slate-600 font-medium hover:text-teal-600 underline underline-offset-2 transition-colors">Privacy Policy</button> and{' '}
            <button onClick={() => navigate('/cookies')} className="text-slate-600 font-medium hover:text-teal-600 underline underline-offset-2 transition-colors">Cookie Policy</button>.
          </p>
        </div>
      </div>
    </footer>
  );
}
