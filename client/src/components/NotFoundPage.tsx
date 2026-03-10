import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 flex flex-col items-center justify-center px-4 font-sans text-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-black text-xl text-slate-900">FindStreak</span>
      </div>

      {/* 404 Display */}
      <div className="text-center max-w-md">
        <div className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-emerald-400 select-none mb-2">
          404
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          This page doesn't exist or may have been moved. Let's get you back somewhere useful.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-teal-200 text-teal-700 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> Go to Dashboard
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Useful pages</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { label: 'How It Works', path: '/how-it-works' },
              { label: 'About', path: '/about-us' },
              { label: 'Sign Up', path: '/signup' },
              { label: 'Login', path: '/signin' },
              { label: 'Contact', path: '/contact-us' },
            ].map(l => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="text-teal-600 hover:text-teal-800 font-medium hover:underline transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
