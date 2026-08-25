import { apiFetch } from '../utils/apiFetch';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Info, BookOpen, Lightbulb, Zap, AlertTriangle, X, Code, Loader2 } from 'lucide-react';

export function TaskGuideView({ task, projectTitle, onBack, onMarkComplete }: any) {
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a detailed step-by-step guide for the task: "${task?.text}".`,
          context: {
            type: 'project',
            projectTitle: projectTitle || 'Project',
            currentTask: task?.text
          },
          role: 'Software Engineer'
        })
      });

      if (!response.ok) {
         const errText = await response.text();
         console.error("AI API Error:", errText);
         throw new Error(`Server returned ${response.status}: ${errText.slice(0, 100)}`);
      }

      const data = await response.json();
      const match = data.reply.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : null;
      if (parsed) {
        setGuide(parsed);
      } else {
        setGuide({
          title: task?.text,
          overview: "We couldn't generate a guide dynamically. Please try again or ask the AI in the sidebar.",
          steps: [],
          tips: [],
          troubleshooting: []
        });
      }
    } catch (err: any) {
      console.error("TaskGuideView fetch error:", err);
      setGuide({
        title: task?.text,
        overview: `Network or generation error: ${err.message || 'Unknown error'}. Check your connection or ask the AI in the sidebar.`,
        steps: [],
        tips: [],
        troubleshooting: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide();
  }, [task, projectTitle]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center animate-in fade-in duration-300">
         <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
         <h3 className="text-lg font-bold text-slate-800">Generating Guide...</h3>
         <p className="text-slate-500 text-sm mt-2">The AI is putting together step-by-step instructions for "{task?.text}".</p>
      </div>
    );
  }

  if (!guide) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
      
      {/* Breadcrumb + Back Button — always clearly visible */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        {/* Breadcrumb */}
        <p className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
          <span className="text-slate-500">{projectTitle || 'Project'}</span>
          <span>›</span>
          <span className="text-emerald-600 font-bold truncate max-w-[200px]">{task?.text}</span>
        </p>
        {/* Back Button — large and obvious */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[13px] rounded-lg transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> ← Back to my tasks
        </button>
      </div>

      {/* Hero Header — improved gradient */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-teal-200 text-[11px] font-bold uppercase tracking-widest mb-1">Step-by-Step Guide</p>
            <h2 className="text-xl font-bold leading-tight">{guide.title || task?.text}</h2>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Overview */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-[#00875a] text-lg font-bold mb-3"><Info className="w-5 h-5"/> Overview</h3>
          <p className="text-slate-700 leading-relaxed text-[15px]">{guide.overview}</p>
          
          {(!guide.steps || guide.steps.length === 0 || guide.overview.toLowerCase().includes('error') || guide.overview.includes("couldn't generate")) && (
             <button 
               onClick={fetchGuide}
               className="mt-6 px-4 py-2 bg-[#00875a] hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
             >
               <Zap className="w-4 h-4" /> Try Generating Again
             </button>
          )}
        </div>

        {/* Steps */}
        {guide.steps && guide.steps.length > 0 && (
          <div className="mb-10">
            <h3 className="flex items-center gap-2 text-[#00875a] text-lg font-bold mb-5"><BookOpen className="w-5 h-5"/> Step-by-Step Instructions</h3>
            <div className="space-y-4">
              {guide.steps.map((step: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm transition-all hover:border-emerald-200">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00875a] text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h4 className="font-bold text-slate-800 text-[16px] mb-2">Step {idx+1}: {step.title}</h4>
                      <p className="text-slate-600 text-[14px] leading-relaxed mb-4">{step.description}</p>
                      
                      {step.code && (
                        <div className="bg-[#0f172a] rounded-xl overflow-hidden relative group">
                          <button 
                            className="absolute top-3 right-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-xs rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-sm"
                            onClick={() => navigator.clipboard.writeText(step.code)}
                          >
                            <Code className="w-3.5 h-3.5" /> Copy
                          </button>
                          <pre className="p-5 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                            {step.code}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {guide.tips && guide.tips.length > 0 && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-[#00875a] text-lg font-bold mb-4"><Lightbulb className="w-5 h-5"/> Pro Tips</h3>
            <div className="space-y-2.5">
              {guide.tips.map((tip: string, idx: number) => (
                <div key={idx} className="bg-emerald-50/80 border border-emerald-100 rounded-lg p-3.5 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-[#00875a] font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        {guide.troubleshooting && guide.troubleshooting.length > 0 && (
          <div className="mb-8">
             <h3 className="flex items-center gap-2 text-rose-600 text-lg font-bold mb-4"><AlertTriangle className="w-5 h-5"/> Troubleshooting</h3>
             <div className="space-y-2.5">
              {guide.troubleshooting.map((trouble: string, idx: number) => (
                <div key={idx} className="bg-orange-50/50 border border-orange-200 rounded-lg p-3.5 flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-rose-900">{trouble}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-100 space-y-3">
          <button 
            onClick={() => { apiFetch('/api/auth/add-xp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount: 50 }) }); onMarkComplete(); }}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-lg"
          >
            <CheckCircle2 className="w-5 h-5" /> ✓ I've completed this task! (+50 XP)
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go back to task list
          </button>
        </div>
      </div>

    </div>
  );
}
