import { useState, useRef, useEffect } from 'react';
import { Briefcase, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface CareerTrackCardProps {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
  isSwitching: boolean;
  onOpenTrack: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function CareerTrackCard({
  name,
  role,
  isActive,
  isSwitching,
  onOpenTrack,
  onRename,
  onDelete
}: CareerTrackCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const cleanRole = (r: string) => r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

  return (
    <div className={`bg-white rounded-xl border ${isActive ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-sm'} transition-all duration-200 p-5 flex flex-col relative`}>
      {isActive && (
        <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
          Current track
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4 mt-2">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-[16px] font-extrabold text-slate-900 leading-snug truncate" title={name}>
            {name}
          </h2>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 mt-1 truncate" title={role}>
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{cleanRole(role)}</span>
          </div>
        </div>
        
        <div className="relative shrink-0" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-label="Actions menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
              <button
                onClick={() => { setMenuOpen(false); onRename(); }}
                className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                Rename
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full text-left px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <p className="text-[12px] text-slate-500 font-medium mb-4">
          This track is currently active. Learning paths and projects will use this context.
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={onOpenTrack}
          disabled={isSwitching}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500' 
              : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm'
          }`}
        >
          {isSwitching ? (
            <span className="flex items-center gap-2">
              <div className={`w-4 h-4 border-2 rounded-full animate-spin ${isActive ? 'border-emerald-200 border-t-emerald-600' : 'border-white/30 border-t-white'}`} />
              Opening track...
            </span>
          ) : (
            <>
              Open track
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
