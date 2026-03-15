import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Compass, BookOpen, Layers, Mail } from 'lucide-react';

export default function LandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Compass className="w-4 h-4" /> },
    { name: 'How It Works', path: '/how-it-works', icon: <Layers className="w-4 h-4" /> },
    { name: 'About Us', path: '/about', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Contact', path: '/contact', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-200 group-hover:shadow-teal-300 transition-all duration-300 group-hover:scale-105">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              FindStreak
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5 shadow-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>{link.icon}</span>
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => navigate('/signin')}
              className="hidden sm:block text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors px-2 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md shadow-teal-200 hover:shadow-teal-300 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Your Journey
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
