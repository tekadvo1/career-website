import { apiFetch } from '../utils/apiFetch';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Info, Code, Play, Target, CheckSquare, Link, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
         throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const match = data.reply.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : null;
      if (parsed) {
        setGuide(parsed);
      } else {
        setGuide({
          title: task?.text,
          understand: "We couldn't generate a guide dynamically. Please try again or ask the AI.",
          build: "", try_it: "", expected_result: "", check_your_work: "", resources: []
        });
      }
    } catch (err: any) {
      console.error("TaskGuideView fetch error:", err);
      setGuide({
        title: task?.text,
        understand: `Network or generation error: ${err.message || 'Unknown error'}. Check your connection or ask the AI.`,
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
         <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
         <h3 className="text-lg font-bold text-slate-800">Generating Guide...</h3>
         <p className="text-slate-500 text-sm mt-2 text-center max-w-md">The AI is putting together step-by-step instructions for "{task?.text}".</p>
      </div>
    );
  }

  if (!guide) return null;

  const Section = ({ title, icon, content, colorClass }: { title: string, icon: any, content: string | string[], colorClass: string }) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
      <div className="mb-8">
        <h3 className={`flex items-center gap-2 text-lg font-bold mb-4 ${colorClass}`}>
          {icon} {title}
        </h3>
        <div className="text-slate-700 leading-relaxed text-[15px] prose prose-slate max-w-none prose-p:mb-4 prose-pre:bg-slate-900 prose-pre:text-slate-300 prose-pre:p-4 prose-pre:rounded-xl">
          {Array.isArray(content) ? (
            <ul className="list-disc pl-5 space-y-2">
              {content.map((item, i) => (
                <li key={i}><ReactMarkdown>{item}</ReactMarkdown></li>
              ))}
            </ul>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      
      {/* Breadcrumb + Back Button */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-3 text-slate-500 hover:text-emerald-600 font-semibold text-[13px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Outline
        </button>
        <p className="text-[12px] text-slate-500 font-medium flex items-center gap-2 truncate">
          <span>{projectTitle || 'Project'}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">{task?.text}</span>
        </p>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl flex-shrink-0">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-1">Task Guide</p>
            <h2 className="text-xl font-bold leading-tight">{guide.title || task?.text}</h2>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        <Section title="Understand" icon={<Info className="w-5 h-5"/>} content={guide.understand} colorClass="text-indigo-600" />
        <Section title="Build" icon={<Code className="w-5 h-5"/>} content={guide.build} colorClass="text-emerald-600" />
        <Section title="Try It" icon={<Play className="w-5 h-5"/>} content={guide.try_it} colorClass="text-amber-600" />
        <Section title="Expected Result" icon={<Target className="w-5 h-5"/>} content={guide.expected_result} colorClass="text-blue-600" />
        <Section title="Check Your Work" icon={<CheckSquare className="w-5 h-5"/>} content={guide.check_your_work} colorClass="text-purple-600" />
        <Section title="Resources & Tips" icon={<Link className="w-5 h-5"/>} content={guide.resources} colorClass="text-slate-600" />

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button 
            onClick={() => { 
                apiFetch('/api/auth/add-xp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount: 50 }) }); 
                onMarkComplete(); 
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-[15px]"
          >
            <CheckCircle2 className="w-5 h-5" /> Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
