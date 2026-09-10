import { apiFetch } from '../utils/apiFetch';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, Info, Code, Play, Target, CheckSquare, 
  Link, Loader2, Sparkles, BookOpen, AlertCircle, Copy, Check, MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { TaskGuide } from './projects/projectModel';

export function TaskGuideView({ 
  project, 
  task, 
  onBack, 
  onMarkComplete, 
  onAskAI,
  guidanceMode,
  onGuidanceModeChange 
}: any) {
  const [guide, setGuide] = useState<TaskGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchGuide = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a detailed step-by-step guide for the task: "${task?.text}".`,
          context: {
            type: 'project',
            projectId: project?.id || project?.projectId,
            projectTitle: project?.title || 'Project',
            taskId: task?.id,
            currentTask: task?.text
          },
          role: project?.role || 'Software Engineer'
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
        throw new Error("Invalid format received from AI.");
      }
    } catch (err: any) {
      console.error("TaskGuideView fetch error:", err);
      setError(`Failed to load guide: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      fetchGuide();
    }
  }, [task, project?.id]);

  if (loading) {
    return (
      <div className="bg-white flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
         <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
         <h3 className="text-lg font-bold text-slate-800">Generating Guide...</h3>
         <p className="text-slate-500 text-sm mt-2 text-center max-w-md px-4">
           The AI is generating project-specific instructions for "{task?.text}".
         </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white flex flex-col items-center justify-center h-full animate-in fade-in p-8 text-center">
         <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
         <h3 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h3>
         <p className="text-slate-600 text-[14px] max-w-md mb-6">{error}</p>
         <button onClick={fetchGuide} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
           Retry Generation
         </button>
      </div>
    );
  }

  if (!guide) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAskContext = (action: string, contextSnippet?: string) => {
    let msg = action;
    if (contextSnippet) {
      msg += `\n\nContext:\n\`\`\`\n${contextSnippet}\n\`\`\``;
    }
    onAskAI(msg);
  };

  const Section = ({ title, icon, content, colorClass, action }: { title: string, icon: any, content: string | string[], colorClass: string, action?: string }) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
      <div className="mb-10 group relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`flex items-center gap-2 text-lg font-bold ${colorClass}`}>
            {icon} {title}
          </h3>
          {action && (
            <button 
              onClick={() => handleAskContext(`Please ${action.toLowerCase()} for the task "${task?.text}".`, typeof content === 'string' ? content : content.join('\n'))}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> {action}
            </button>
          )}
        </div>
        <div className="text-slate-700 leading-relaxed text-[15px] prose prose-slate max-w-none prose-p:mb-4">
          {Array.isArray(content) ? (
            <ul className="list-disc pl-5 space-y-2">
              {content.map((item, i) => (
                <li key={i}><ReactMarkdown components={markdownComponents}>{item}</ReactMarkdown></li>
              ))}
            </ul>
          ) : (
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  // Custom markdown components to handle code blocks with copy buttons
  const markdownComponents: any = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');
      
      if (!inline) {
        return (
          <div className="relative my-6 rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] group/code">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language || 'Code'}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAskContext("Can you explain this code?", codeString)}
                  className="opacity-0 group-hover/code:opacity-100 text-slate-400 hover:text-emerald-400 transition-all p-1"
                  title="Explain code"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleCopy(codeString)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  title="Copy code"
                >
                  {copiedCode === codeString ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto text-[13px] text-slate-300 font-mono leading-relaxed whitespace-pre">
              {children}
            </div>
          </div>
        );
      }
      return <code className="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-[13px] font-mono before:content-none after:content-none" {...props}>{children}</code>;
    }
  };

  return (
    <div className="bg-white h-full flex flex-col relative w-full overflow-hidden">
      
      {/* Breadcrumb + Back Button (Mobile only) */}
      <div className="lg:hidden px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-[13px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Outline
        </button>
      </div>

      {/* Task Header */}
      <div className="border-b border-slate-200 bg-white p-6 md:p-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BookOpen className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Task Guide</span>
              {task?.completed && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>}
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{guide.title || task?.text}</h2>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 w-fit h-fit">
            <button 
              onClick={() => onGuidanceModeChange('step')} 
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${guidanceMode === 'step' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Step-by-step
            </button>
            <button 
              onClick={() => onGuidanceModeChange('quick')} 
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${guidanceMode === 'quick' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Quick
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto w-full max-w-4xl mx-auto">
        <Section title="Understand" icon={<Info className="w-5 h-5"/>} content={guide.understand} colorClass="text-indigo-600" action="Explain this concept" />
        <Section title="Before You Begin" icon={<CheckSquare className="w-5 h-5"/>} content={guide.before_you_begin} colorClass="text-slate-700" />
        
        {guidanceMode === 'step' ? (
          <Section title="Implement" icon={<Code className="w-5 h-5"/>} content={guide.implement_step} colorClass="text-emerald-600" action="Give me a hint" />
        ) : (
          <Section title="Quick Implementation" icon={<Code className="w-5 h-5"/>} content={guide.implement_quick} colorClass="text-emerald-600" action="Give me a hint" />
        )}
        
        <Section title="Try It" icon={<Play className="w-5 h-5"/>} content={guide.try_it} colorClass="text-amber-600" />
        <Section title="Expected Result" icon={<Target className="w-5 h-5"/>} content={guide.expected_result} colorClass="text-blue-600" />
        <Section title="Check Your Work" icon={<CheckSquare className="w-5 h-5"/>} content={guide.check_your_work} colorClass="text-purple-600" />
        <Section title="Resources & Tips" icon={<Link className="w-5 h-5"/>} content={guide.resources} colorClass="text-slate-600" />

        {/* Action Area */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col gap-4">
          {!task?.completed ? (
            <button 
              onClick={() => onMarkComplete(true)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-[15px]"
            >
              <CheckCircle2 className="w-5 h-5" /> Mark as Complete & Next Task
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => onMarkComplete(true)}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-[15px]"
              >
                Continue to Next Task
              </button>
              <button 
                onClick={() => onMarkComplete(false)}
                className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center transition-colors text-[13px]"
              >
                Undo Completion
              </button>
            </div>
          )}
          
          <button 
            onClick={() => handleAskContext("I'm stuck on this task. Here is what I tried:")}
            className="text-[13px] font-bold text-slate-500 hover:text-slate-800 underline underline-offset-4 decoration-slate-300 mx-auto mt-2"
          >
            I'm stuck, help me debug
          </button>
        </div>
      </div>
    </div>
  );
}
