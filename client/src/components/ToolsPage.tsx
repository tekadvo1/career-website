import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Award,
  Gamepad2,
  Search,
  Sparkles,
  Wrench,
  LayoutGrid,
  Terminal,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export default function ToolsPage() {
  const navigate = useNavigate();

  const toolCategories = [
    {
      label: 'Achievements',
      subtitle: 'View your milestones',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      route: '/achievements',
      badge: 'NEW',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Quiz & Games',
      subtitle: 'Play learning games',
      icon: <Gamepad2 className="w-5 h-5 text-teal-600" />,
      route: '/quiz-game',
      badge: 'NEW',
      bgColor: 'bg-teal-100',
    },

    {
      label: 'Start New Journey',
      subtitle: 'Analyze new resume',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      route: '/onboarding',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Role Analysis',
      subtitle: 'AI career insights',
      icon: <Search className="w-5 h-5 text-blue-600" />,
      route: '/role-analysis',
      badge: 'NEW',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Workflow Lifecycle',
      subtitle: 'Productivity tools',
      icon: <Wrench className="w-5 h-5 text-orange-600" />,
      route: '/workflow-lifecycle',
      badge: 'NEW',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Tech Stack & Tools',
      subtitle: 'AI trending analysis',
      icon: <Terminal className="w-5 h-5 text-indigo-600" />,
      route: '/tech-stack',
      badge: 'NEW',
      bgColor: 'bg-indigo-100',
    },
    {
      label: 'Interview Guide',
      subtitle: 'AI Prep & Q&A',
      icon: <MessageSquare className="w-5 h-5 text-pink-600" />,
      route: '/interview-guide',
      badge: 'NEW',
      bgColor: 'bg-pink-100',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar activePage="tools" />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm pl-16 md:pl-0">
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center gap-2.5">
             <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                 <LayoutGrid className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-800">Advanced Tools Container</h1>
                <p className="text-xs text-slate-500 mt-0.5">Access all your extra career, study, and productivity utilities</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {toolCategories.map((tool, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(tool.route)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
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
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{tool.label}</h3>
                      <p className="text-xs text-slate-500 mt-1">{tool.subtitle}</p>
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
