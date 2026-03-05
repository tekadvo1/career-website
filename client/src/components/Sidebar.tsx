import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Menu,
  User,
  Search,
  Briefcase,
  Target,
  BarChart3,
  LayoutDashboard,
  Award,
  Gamepad2,
  Sparkles,
  BookOpen,
  Wrench,
  LogOut,
  Code,
  Zap,
} from 'lucide-react';

interface NavItem {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
}

interface SidebarProps {
  activePage?: string; // e.g. 'dashboard', 'achievements', 'missions', etc.
}

const navItems: NavItem[] = [
  {
    label: 'View Profile',
    subtitle: 'Manage your account',
    icon: <User className="w-5 h-5 text-emerald-600" />,
    route: '/profile',
  },
  {
    label: 'Start New Journey',
    subtitle: 'Analyze new resume',
    icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    route: '/onboarding',
  },
  {
    label: 'Role Analysis',
    subtitle: 'AI career insights',
    icon: <Search className="w-5 h-5 text-emerald-600" />,
    route: '/role-analysis',
    badge: 'NEW',
  },
  {
    label: 'Career Workspaces',
    subtitle: 'Explore multiple careers',
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    route: '/missions',
    badge: 'NEW',
  },
  {
    label: 'My Learning Progress',
    subtitle: 'Track your roadmap',
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    route: '/roadmap',
  },
  {
    label: 'Project Dashboard',
    subtitle: 'Browse AI projects',
    icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    route: '/dashboard',
  },
  {
    label: 'My Projects',
    subtitle: 'View ongoing projects',
    icon: <LayoutDashboard className="w-5 h-5 text-emerald-600" />,
    route: '/my-projects',
  },
  {
    label: 'Achievements',
    subtitle: 'View your milestones',
    icon: <Award className="w-5 h-5 text-emerald-600" />,
    route: '/achievements',
    badge: 'NEW',
  },
  {
    label: 'Quiz & Games',
    subtitle: 'Play learning games',
    icon: <Gamepad2 className="w-5 h-5 text-emerald-600" />,
    route: '/missions',
    badge: 'NEW',
  },
  {
    label: 'AI Assistant',
    subtitle: 'Get learning help',
    icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    route: '/ai-assistant',
  },
  {
    label: 'Learning Resources',
    subtitle: 'Browse materials',
    icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
    route: '/resources',
  },
  {
    label: 'Workflow Lifecycle',
    subtitle: 'Productivity tools',
    icon: <Wrench className="w-5 h-5 text-emerald-600" />,
    route: '/workflow-lifecycle',
    badge: 'NEW',
  },
];

export default function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) return;
    
    // Connect to global real-time UI stream for XP/Levels
    const es = new EventSource(`/api/realtime/stream?userId=${user.id}`);
    
    const handleSnapshot = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.totalXP !== undefined) {
          setXp(data.totalXP);
        }
      } catch(err) {}
    };

    es.addEventListener('snapshot', handleSnapshot);
    es.addEventListener('refresh', handleSnapshot); // For broadcast notify pushes

    return () => {
      es.close();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastRoleAnalysis');
    setIsOpen(false);
    navigate('/signin');
  };

  const isActive = (route: string) => {
    if (activePage) {
      // Manual override
      return route.includes(activePage);
    }
    return location.pathname === route;
  };

  return (
    <>
      {/* ─── Hamburger Button ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-40 p-2 md:p-2.5 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-md border border-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
        </button>
      )}

      {/* ─── Backdrop ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── Slide-in Drawer ─── */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                FindStreak
              </h2>
              <p className="text-[9px] text-slate-500 leading-none">Navigation Menu</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-1 no-scrollbar flex flex-col justify-start">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route + item.label}
                onClick={() => {
                  setIsOpen(false);
                  if (item.route === '/onboarding') {
                    navigate(item.route, { state: { force: true } });
                  } else {
                    navigate(item.route);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 transition-all group shrink-0 ${
                  active
                    ? 'bg-emerald-50 border-l-4 border-emerald-600'
                    : 'hover:bg-emerald-50 border-l-4 border-transparent'
                }`}
              >
                {/* Icon Box */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors [&>svg]:w-4 [&>svg]:h-4 ${
                    active
                      ? 'bg-emerald-200'
                      : 'bg-emerald-100 group-hover:bg-emerald-200'
                  }`}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-[13px] leading-tight transition-colors truncate ${
                        active
                          ? 'text-emerald-700'
                          : 'text-slate-900 group-hover:text-emerald-700'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="flex-shrink-0 px-1 py-[2px] bg-red-500 text-white text-[9px] font-bold rounded leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0 ${active ? 'text-slate-600' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Real-Time XP Module */}
        <div className="mx-4 mt-2 mb-2 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg relative overflow-hidden group shrink-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
             <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="font-extrabold text-[13px] tracking-tight text-white shadow-sm">Level {Math.floor(xp / 100) + 1}</span>
             </div>
             <span className="text-[9px] font-black px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded shadow-inner uppercase tracking-wider">
                XP {xp}
             </span>
          </div>
          <div className="flex justify-between items-end mb-1.5 relative z-10">
            <p className="text-[10px] text-indigo-100 font-medium">To next level:</p>
            <p className="text-[10px] font-bold text-amber-300">{100 - (xp % 100)}</p>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden shadow-inner relative z-10">
             <div 
               className="bg-gradient-to-r from-amber-300 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
               style={{ width: `${Math.max(xp % 100, 2)}%` }} // ensure visible sliver
             ></div>
          </div>
        </div>

        {/* Logout Row */}
        <div className="border-t border-slate-200 px-4 py-2 flex-shrink-0 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2 group hover:bg-red-50 rounded-lg px-2 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-[13px] leading-tight text-slate-700 group-hover:text-red-600 transition-colors">
                Sign Out
              </span>
              <p className="text-[10px] text-slate-500 mt-0">Log out of your account</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 py-2 flex-shrink-0 text-center bg-slate-50">
          <p className="text-[9px] text-slate-400 font-medium">Powered by FindStreak</p>
        </div>
      </div>
    </>
  );
}
