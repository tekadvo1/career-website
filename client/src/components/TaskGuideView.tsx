import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export function TaskGuideView({ taskId, guide, onBack, onMarkComplete }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </button>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{guide.title}</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{guide.overview}</p>
        </div>

        {guide.steps && guide.steps.length > 0 && (
          <div className="space-y-6 mt-8">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Implementation Guide</h3>
            {guide.steps.map((step: any, idx: number) => (
              <div key={idx} className="relative pl-6 pb-2 border-l-2 border-emerald-100 last:border-transparent">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1 border-2 border-white shadow-sm" />
                <h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4>
                <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                {step.code && (
                  <div className="bg-slate-900 rounded-lg p-4 shadow-inner overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed max-w-full">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}
                {step.image && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 shadow-sm max-w-sm">
                    <img src={step.image} alt="Step visual guide" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {guide.tips && guide.tips.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mt-8">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 text-sm">
              <span className="bg-emerald-200 p-1 rounded">💡</span> Pro Tips
            </h3>
            <ul className="space-y-2">
              {guide.tips.map((tip: string, idx: number) => (
                <li key={idx} className="flex gap-2 text-sm text-emerald-900">
                  <span className="text-emerald-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guide.troubleshooting && guide.troubleshooting.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mt-6">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3 text-sm">
              <span className="bg-amber-200 p-1 rounded">⚠️</span> Troubleshooting
            </h3>
            <ul className="space-y-2">
              {guide.troubleshooting.map((trouble: string, idx: number) => (
                <li key={idx} className="flex gap-2 text-sm text-amber-900">
                  <span className="text-amber-500 font-bold">•</span>
                  {trouble}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">Need help? Use the AI Assistant on the right panel.</p>
        <button 
          onClick={onMarkComplete}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark Task Complete
        </button>
      </div>
    </div>
  );
}
