import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectAdvisor from './ProjectAdvisor';
import {
  Search,
  Sparkles,
  Wrench,
  LayoutGrid,
  Terminal,
  MessageSquare,
  ChevronRight,
  FolderTree,
} from 'lucide-react';

export default function ToolsPage() {
  const navigate = useNavigate();
  const [showAdvisor, setShowAdvisor] = useState(false);

  // Restore advisor if user refreshed mid-flow
  useEffect(() => {
    const saved = sessionStorage.getItem('advisor_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.step > 1) setShowAdvisor(true);
      } catch (_e) { /* ignore */ }
    }
  }, []);

  // ── If the advisor is open, render it full-screen (replaces content area) ──
  if (showAdvisor) {
    return <ProjectAdvisor onClose={() => setShowAdvisor(false)} />;
  }

  const toolCategories = [
    {
      label:    'Start New Journey',
      subtitle: 'Analyze a new role or resume',
      icon:     <Sparkles className="w-5 h-5 text-purple-600" />,
      bgColor:  'bg-purple-100',
      onClick:  () => navigate('/onboarding', { state: { force: true } }),
    },
    {
      label:    'Role Analysis',
      subtitle: 'AI career insights',
      icon:     <Search className="w-5 h-5 text-blue-600" />,
      bgColor:  'bg-blue-100',
      badge:    'NEW',
      onClick:  () => navigate('/role-analysis'),
    },
    {
      label:    'Workflow Lifecycle',
      subtitle: 'Productivity tools',
      icon:     <Wrench className="w-5 h-5 text-orange-600" />,
      bgColor:  'bg-orange-100',
      badge:    'NEW',
      onClick:  () => navigate('/workflow-lifecycle'),
    },
    {
      label:    'Tech Stack & Tools',
      subtitle: 'AI trending analysis',
      icon:     <Terminal className="w-5 h-5 text-indigo-600" />,
      bgColor:  'bg-indigo-100',
      badge:    'NEW',
      onClick:  () => navigate('/tech-stack'),
    },
    {
      label:    'Interview Guide',
      subtitle: 'AI Prep & Q&A',
      icon:     <MessageSquare className="w-5 h-5 text-pink-600" />,
      bgColor:  'bg-pink-100',
      badge:    'NEW',
      onClick:  () => navigate('/interview-guide'),
    },
    {
      label:    'Project Structure Advisor',
      subtitle: 'AI picks your stack & builds your folder structure',
      icon:     <FolderTree className="w-5 h-5 text-emerald-600" />,
      bgColor:  'bg-emerald-100',
      badge:    'NEW',
      highlight: true,
      onClick:  () => setShowAdvisor(true),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      <Sidebar activePage="tools" />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm pl-16 md:pl-0">
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Advanced Tools</h1>
              <p className="text-xs text-slate-500 mt-0.5">All your career, study, and productivity utilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool grid */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolCategories.map((tool, idx) => (
            <div
              key={idx}
              onClick={tool.onClick}
              className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between cursor-pointer group transition-all hover:shadow-md ${
                tool.highlight
                  ? 'border-emerald-200 hover:border-emerald-400'
                  : 'border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${tool.bgColor} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {tool.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.subtitle}</p>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
