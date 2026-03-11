import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';

export default function LandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about-us' },
    { label: 'Contact', path: '/contact-us' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/30'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-900/50 group-hover:shadow-teal-700/60 transition-all">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Find<span className="text-teal-400">Streak</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'text-teal-400 bg-teal-950/60'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-lg shadow-lg shadow-teal-900/40 hover:shadow-teal-700/50 transition-all duration-200"
            >
              Sign Up Free
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0f0d]/98 backdrop-blur-xl border-t border-white/[0.06] px-4 py-5 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-teal-950/60 text-teal-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2">
            <button
              onClick={() => { navigate('/signin'); setMobileOpen(false); }}
              className="w-full py-3 text-sm font-bold text-slate-300 border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all"
            >
              Login
            </button>
            <button
              onClick={() => { navigate('/signup'); setMobileOpen(false); }}
              className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-400 hover:to-emerald-400 transition-all"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
