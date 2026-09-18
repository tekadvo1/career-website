import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Pencil, X, Loader2 } from 'lucide-react';

interface RenameCareerTrackDialogProps {
  initialName: string;
  onClose: () => void;
  onSubmit: (newName: string) => Promise<void>;
}

export default function RenameCareerTrackDialog({ initialName, onClose, onSubmit }: RenameCareerTrackDialogProps) {
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === initialName) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename career track.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-track-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h2 id="rename-track-title" className="text-[15px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              <Pencil className="w-4 h-4" />
            </div>
            Rename Track
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="space-y-1.5">
              <label htmlFor="rename-input" className="block text-[13px] font-bold text-slate-700">Track name</label>
              <input
                id="rename-input"
                ref={inputRef}
                type="text"
                required
                maxLength={100}
                className="w-full text-[14px] font-medium p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 hover:bg-white shadow-sm text-slate-900"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-[13px] rounded-lg border border-red-100 flex items-start gap-2">
                <span className="font-semibold shrink-0">Error:</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="px-4 py-2 rounded-lg font-bold text-[13px] text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-lg font-bold text-[13px] text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
