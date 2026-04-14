import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Zap, ChevronDown,
  BrainCircuit, Code2, Target, MessageSquare,
  Briefcase, BookOpen, BarChart3,
  Mic, Gamepad2, Layers,
  Map, FileText, ArrowRight, Sparkles
} from 'lucide-react';

const featureGroups = [
  {
    heading: 'Analyse & Plan',
    items: [
      { icon: BrainCircuit, color: 'text-teal-600', bg: 'bg-teal-50', label: 'AI Role Analysis', desc: 'Upload your resume — AI maps your exact skill gaps instantly', path: '/signup' },
      { icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Learning Roadmap', desc: 'Phase-by-phase personalised roadmap for your target role', path: '/signup' },
      { icon: Layers, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Career Workspaces', desc: 'Manage multiple tech role paths at the same time', path: '/signup' },
      { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Resume Upload & Parse', desc: 'AI reads your PDF/DOCX resume and builds your profile', path: '/signup' },
    ],
  },
  {
    heading: 'Learn & Build',
    items: [
      { icon: Code2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Project Workspace', desc: 'Daily real-world tasks inside industry-style projects', path: '/signup' },
      { icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Daily Missions & Streaks', desc: 'XP-based daily tasks that build consistent learning habits', path: '/signup' },
      { icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50', label: 'AI Learning Assistant', desc: '24/7 AI chat — guides every task without giving the answer', path: '/signup' },
      { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Resources Hub', desc: 'Curated learning materials matched to your roadmap phase', path: '/signup' },
    ],
  },
  {
    heading: 'Practice & Prove',
    items: [
      { icon: Gamepad2, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Quiz Game', desc: 'Knowledge quizzes per role and phase — gamified learning', path: '/signup' },
      { icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Real-time Mock Interview', desc: 'AI-powered live mock interviews with instant feedback', path: '/signup' },
      { icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Interview Guide', desc: 'Role-specific technical & behavioural question sets', path: '/signup' },
      { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Portfolio Builder', desc: 'Auto-generated shareable portfolio from your real projects', path: '/signup' },
    ],
  },
];

function FeaturesDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full left-0 mt-2 z-50 origin-top-left"
    >
      <div className="absolute -top-1.5 left-10 w-3 h-3 rotate-45 bg-white border-l border-t border-slate-200" />
      
      <div className="w-[860px] max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden relative">
        {/* Top banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">FindStreak Platform Features</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5" /> Powered by AI
          </span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-3 gap-0 p-6">
          {featureGroups.map((group, gi) => (
            <div key={gi} className={gi < featureGroups.length - 1 ? 'border-r border-slate-100 pr-5 mr-5' : ''}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{group.heading}</p>
              <div className="space-y-1">
                {group.items.map((item, ii) => (
                  <button
                    key={ii}
                    onClick={() => { onClose(); navigate(item.path); }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-150 text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 group-hover:text-teal-700 transition-colors leading-tight mb-0.5">{item.label}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">All features unlock after creating your free account.</p>
          <button
            onClick={() => { onClose(); navigate('/signup'); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md transition-all"
          >
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => { setFeaturesOpen(false); setMobileOpen(false); });
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    setFeaturesOpen(false);
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const otherNav = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-slate-100'
        }`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md group-hover:shadow-teal-500/40 transition-shadow">
              <Zap className="w-[17px] h-[17px] text-white fill-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              Find<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Streak</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setFeaturesOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  featuresOpen ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Features
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${featuresOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </button>
              <AnimatePresence>
                {featuresOpen && <FeaturesDropdown onClose={() => setFeaturesOpen(false)} />}
              </AnimatePresence>
            </div>

            {otherNav.map(item => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth CTA */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 inset-x-0 z-40 bg-white border-b border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="mb-3">
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Features</p>
                <div className="grid grid-cols-2 gap-1">
                  {featureGroups.flatMap(g => g.items).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setMobileOpen(false); navigate(item.path); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-left"
                    >
                      <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1">
                {otherNav.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-3">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/signin'); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/signup'); }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 text-center shadow-md"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
