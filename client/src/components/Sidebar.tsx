import { useState } from 'react';
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
    route: '/project-workspace',
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
  const navigate = useNavigate();
  const location = useLocation();

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
          className="fixed top-4 left-4 z-40 p-2.5 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-md border border-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
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
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                FindStreak
              </h2>
              <p className="text-[10px] text-slate-500 leading-none">Navigation Menu</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route + item.label}
                onClick={() => {
                  setIsOpen(false);
                  navigate(item.route);
                }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all group ${
                  active
                    ? 'bg-emerald-50 border-l-4 border-emerald-600'
                    : 'hover:bg-emerald-50 border-l-4 border-transparent'
                }`}
              >
                {/* Icon Box */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
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
                      className={`font-semibold text-sm transition-colors truncate ${
                        active
                          ? 'text-emerald-700'
                          : 'text-slate-900 group-hover:text-emerald-700'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${active ? 'text-slate-600' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout Row */}
        <div className="border-t border-slate-200 px-5 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-3 group hover:bg-red-50 rounded-lg px-2 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-sm text-slate-700 group-hover:text-red-600 transition-colors">
                Sign Out
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Log out of your account</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex-shrink-0 text-center">
          <p className="text-[10px] text-slate-400">Powered by</p>
          <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            FindStreak
          </p>
        </div>
      </div>
    </>
  );
}
