import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectAdvisor from './ProjectAdvisor';
import { getUser } from '../utils/auth';
import {
  Search,
  Wrench,
  LayoutGrid,
  Terminal,
  MessageSquare,
  ChevronRight,
  FolderTree,
} from 'lucide-react';

interface ToolAction {
  id: string;
  label: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
  bgColor: string;
  route?: string;
  onClick?: () => void;
}

interface ToolSection {
  id: string;
  title: string;
  items: ToolAction[];
}

export default function ToolsPage() {
  const navigate = useNavigate();
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [hasAdvisorDraft, setHasAdvisorDraft] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user: any = getUser() || {};
      if (user.lastRoleAnalysis && user.lastRoleAnalysis.role) {
        setCurrentRole(user.lastRoleAnalysis.role);
      }
    } catch (e) {
      console.error(e);
    }

    const saved = sessionStorage.getItem('advisor_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.step > 1) {
          setHasAdvisorDraft(true);
        }
      } catch (_e) {
        // ignore invalid JSON
      }
    }
  }, []);

  if (showAdvisor) {
    return <ProjectAdvisor onClose={() => setShowAdvisor(false)} />;
  }

  const navigateToTool = (route: string) => {
    navigate(route, { state: { role: currentRole } });
  };

  const sections: ToolSection[] = [
    {
      id: 'explore-careers',
      title: 'EXPLORE CAREERS',
      items: [
        {
          id: 'role-analysis',
          label: 'Explore a role',
          description: 'Understand the responsibilities, skills, and learning options for a career.',
          actionText: 'Explore role',
          icon: <Search className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-100',
          route: '/role-analysis',
        },
        {
          id: 'tech-stack',
          label: 'Tools for your role',
          description: 'Understand which tools support your work and why they matter.',
          actionText: 'Explore tools',
          icon: <Terminal className="w-5 h-5 text-indigo-600" />,
          bgColor: 'bg-indigo-100',
          route: '/tech-stack',
        },
        {
          id: 'workflow-lifecycle',
          label: 'How this role works',
          description: 'See the stages of everyday work and how the tools fit together.',
          actionText: 'View workflow',
          icon: <Wrench className="w-5 h-5 text-orange-600" />,
          bgColor: 'bg-orange-100',
          route: '/workflow-lifecycle',
        }
      ]
    },
    {
      id: 'learn-and-practise',
      title: 'LEARN AND PRACTISE',
      items: [
        {
          id: 'interview-guide',
          label: 'Interview practice',
          description: 'Prepare answers and practise questions for your target role.',
          actionText: 'Open interview practice',
          icon: <MessageSquare className="w-5 h-5 text-pink-600" />,
          bgColor: 'bg-pink-100',
          route: '/interview-guide',
        }
      ]
    }
  ];

  const projectSection: ToolSection = {
    id: 'build-projects',
    title: 'BUILD PROJECTS',
    items: [
      {
        id: 'project-advisor',
        label: 'Plan a project',
        description: 'Explore a suitable stack and a proposed project structure.',
        actionText: 'Open project advisor',
        icon: <FolderTree className="w-5 h-5 text-emerald-600" />,
        bgColor: 'bg-emerald-100',
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar activePage="tools" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm pl-16 md:pl-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tools & Utilities</h1>
                <p className="text-sm text-slate-600 mt-1">Explore your career, practise your skills, and plan your next project.</p>
              </div>
            </div>

            {/* Context Area */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Role</span>
                <span className="text-sm font-bold text-slate-800">
                  {currentRole || 'Choose a role'}
                </span>
              </div>
              <button 
                onClick={() => navigate('/onboarding', { state: { force: true } })}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
                aria-label="Explore another career"
              >
                Explore another career
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:px-6 pb-20">
        <div className="space-y-12">
          
          {/* Render Sections */}
          {[...sections, projectSection].map((section) => (
            <section key={section.id} aria-labelledby={`heading-${section.id}`}>
              <h2 id={`heading-${section.id}`} className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                          {tool.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{tool.label}</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">
                        {tool.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto">
                      {tool.id === 'project-advisor' ? (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => {
                              sessionStorage.removeItem('advisor_state'); // Start fresh
                              setShowAdvisor(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            {tool.actionText}
                          </button>
                          {hasAdvisorDraft && (
                            <button
                              onClick={() => setShowAdvisor(true)} // Resume
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              Resume draft
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (tool.route) navigateToTool(tool.route);
                            else if (tool.onClick) tool.onClick();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                          {tool.actionText}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

        </div>
      </main>
    </div>
  );
}
