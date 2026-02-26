import React from 'react';
import { X } from 'lucide-react';

export function RightSidebar({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Mission Guide Settings</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features disabled</h3>
            <p className="text-sm text-slate-600">Additional settings will be available here soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
