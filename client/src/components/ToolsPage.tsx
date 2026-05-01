import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectAdvisor from './ProjectAdvisor';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';
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
  const [pastAdvisors, setPastAdvisors] = useState<any[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);

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

  // Fetch past advisors
  useEffect(() => {
    const user = getUser<{ id?: number }>();
    if (!user?.id) {
      setLoadingAdvisors(false);
      return;
    }
    apiFetch(`/api/project-structure/my-advisors?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPastAdvisors(data.advisors);
        setLoadingAdvisors(false);
      })
      .catch(() => setLoadingAdvisors(false));
  }, [showAdvisor]); // Re-fetch when advisor is closed (might have saved a new one)

  // ── Resume past advisor session ──────────────────────────────────────────
  const resumeAdvisor = (adv: any) => {
    sessionStorage.setItem('advisor_state', JSON.stringify({
      step: 4,
      type: adv.role,
      goal: adv.description,
      level: adv.structure_data?.level || 'intermediate',
      recs: adv.structure_data?.recs,
      structure: adv.structure_data?.structure,
    }));
    setShowAdvisor(true);
  };

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

      {/* ── Past Structures Section ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-12 md:px-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderTree className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Your Past Structures</h2>
        </div>

        {loadingAdvisors ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pastAdvisors.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">You haven't generated any project structures yet.</p>
            <button
              onClick={() => setShowAdvisor(true)}
              className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Start the Project Advisor →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastAdvisors.map(adv => (
              <div
                key={adv.id}
                onClick={() => resumeAdvisor(adv)}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 cursor-pointer group transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                      {adv.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(adv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{adv.description}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {adv.structure_data?.structure?.projectDescription || 'Detailed AI-generated project architecture'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {adv.structure_data?.structure?.techStack?.slice(0, 3).map((tech: string) => (
                      <span key={tech} className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                    {(adv.structure_data?.structure?.techStack?.length || 0) > 3 && (
                      <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5">
                        +{(adv.structure_data.structure.techStack.length - 3)}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    View Structure <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
