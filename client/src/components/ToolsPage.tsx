import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Award,
  Gamepad2,
  BookOpen,
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
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      route: '/achievements',
      badge: 'NEW',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Quiz & Games',
      subtitle: 'Play learning games',
      icon: <Gamepad2 className="w-6 h-6 text-teal-600" />,
      route: '/quiz-game',
      badge: 'NEW',
      bgColor: 'bg-teal-100',
    },

    {
      label: 'Learning Resources',
      subtitle: 'Browse materials',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      route: '/resources',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Workflow Lifecycle',
      subtitle: 'Productivity tools',
      icon: <Wrench className="w-6 h-6 text-orange-600" />,
      route: '/workflow-lifecycle',
      badge: 'NEW',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Tech Stack & Tools',
      subtitle: 'AI trending analysis',
      icon: <Terminal className="w-6 h-6 text-indigo-600" />,
      route: '/tech-stack',
      badge: 'NEW',
      bgColor: 'bg-indigo-100',
    },
    {
      label: 'Interview Guide',
      subtitle: 'AI Prep & Q&A',
      icon: <MessageSquare className="w-6 h-6 text-pink-600" />,
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
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                 <LayoutGrid className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Advanced Tools Container</h1>
                <p className="text-sm text-slate-500 mt-1">Access all your extra career, study, and productivity utilities</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((tool, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(tool.route)}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
              >
                  <div>
                      <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                              {tool.icon}
                          </div>
                          {tool.badge && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                  {tool.badge}
                              </span>
                          )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{tool.label}</h3>
                      <p className="text-sm text-slate-500 mt-1.5">{tool.subtitle}</p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                  </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
