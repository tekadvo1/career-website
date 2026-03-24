import { Power, RefreshCcw } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Power className="w-10 h-10 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2">We'll be back shorty</h1>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            FindStreak is currently undergoing scheduled maintenance to improve your experience. We are working hard to bring the site back online quickly.
          </p>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 group"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Check again
          </button>

          <p className="text-xs text-slate-400 mt-6 font-medium">
            Thank you for your patience! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
