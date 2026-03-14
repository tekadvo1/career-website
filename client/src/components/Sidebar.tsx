import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Menu,
  User,
  Briefcase,
  Target,
  BarChart3,
  FolderKanban,
  BookOpen,
  LayoutGrid,
  Bot,
  Settings,
  Code,
  ChevronUp
} from 'lucide-react';
import { getUser } from '../utils/auth';

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
    label: 'Project Dashboard',
    subtitle: 'Browse AI projects',
    icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    route: '/dashboard',
  },
  {
    label: 'Career Workspaces',
    subtitle: 'Explore multiple careers',
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    route: '/workspaces',
    badge: 'NEW',
  },
  {
    label: 'My Learning Progress',
    subtitle: 'Track your roadmap',
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    route: '/roadmap',
  },
  {
    label: 'My Projects',
    subtitle: 'View ongoing projects',
    icon: <FolderKanban className="w-5 h-5 text-emerald-600" />,
    route: '/my-projects',
  },
  {
    label: 'Learning Resources',
    subtitle: 'Browse materials',
    icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
    route: '/resources',
  },
  {
    label: 'AI Assistant',
    subtitle: 'Get learning help',
    icon: <Bot className="w-5 h-5 text-emerald-600" />,
    route: '/ai-assistant',
  },
  {
    label: 'Tools & Utilities',
    subtitle: 'All extra features',
    icon: <LayoutGrid className="w-5 h-5 text-emerald-600" />,
    route: '/tools',
  }
];

export default function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user: any = (getUser() ?? {});
  const displayName = user?.name || user?.username || "";
  const initials = displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G";

  const isActive = (route: string) => {
    if (activePage) {
      // Manual override
      return route.includes(activePage);
    }
    return location.pathname === route;
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 5rem !important; }
        }
      `}</style>
      
      {/* ─── Mobile Hamburger Button ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-2.5 left-2.5 z-40 p-2 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-sm border border-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      )}

      {/* ─── Mobile Backdrop ─── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── Sidebar Container ─── */}
      <div
        className={`fixed top-0 left-0 h-full bg-white z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 overflow-hidden ${
          isOpen ? 'w-72 translate-x-0 shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]' : 'w-72 -translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center p-4 border-b border-slate-200 flex-shrink-0 h-16 ${isOpen ? 'justify-between' : 'justify-center md:px-0'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 md:hidden'}`}>
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div className="flex-shrink-0">
              <h2 className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                FindStreak
              </h2>
              <p className="text-[9px] text-slate-500 leading-none">Navigation Menu</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0 w-8 h-8"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600 hidden md:block" />}
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1 no-scrollbar flex flex-col items-center md:items-stretch">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route + item.label}
                title={!isOpen ? item.label : undefined}
                onClick={() => {
                  if (window.innerWidth < 768) setIsOpen(false);
                  if (item.route === '/onboarding') {
                    navigate(item.route, { state: { force: true } });
                  } else {
                    navigate(item.route);
                  }
                }}
                className={`w-full flex items-center py-2 transition-all group shrink-0 relative ${
                  isOpen ? 'gap-3 px-4' : 'justify-center md:px-0'
                } ${
                  active
                    ? `bg-emerald-50 ${isOpen ? 'border-l-4 border-emerald-600' : 'md:border-l-0 md:border-r-4 md:border-emerald-600 border-l-4 border-emerald-600'}`
                    : `hover:bg-emerald-50 border-transparent ${isOpen ? 'border-l-4' : 'md:border-l-0 md:border-r-4 border-l-4'}`
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
                <div className={`text-left min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'flex-1 opacity-100' : 'w-0 opacity-0 md:w-0'}`}>
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
                      <span className={`flex-shrink-0 px-1 py-[2px] bg-red-500 text-white text-[9px] font-bold rounded leading-none transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 h-0 overflow-hidden'}`}>
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

        {/* Footer with User Actions */}
        <div className="border-t border-slate-200 flex-shrink-0 bg-slate-50 relative">
           
           {/* Expandable Menu */}
           <div className={`absolute bottom-full left-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out overflow-hidden ${(isProfileMenuOpen && isOpen) ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-2 space-y-1 my-1">
                 <button 
                   onClick={() => { if (window.innerWidth < 768) setIsOpen(false); navigate('/profile'); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   <User className="w-4 h-4 text-slate-500" />
                   View Full Profile
                 </button>
                 <button 
                   onClick={() => { if (window.innerWidth < 768) setIsOpen(false); navigate('/settings'); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   <Settings className="w-4 h-4 text-slate-500" />
                   Account Settings
                 </button>
              </div>
           </div>

           {/* User Profile Trigger Bar */}
           <button 
              onClick={() => {
                 if (!isOpen) {
                   setIsOpen(true);
                   setIsProfileMenuOpen(true);
                 } else {
                   setIsProfileMenuOpen(!isProfileMenuOpen);
                 }
              }}
              title={!isOpen ? "Profile menu" : undefined}
              className={`w-full flex items-center transition-colors hover:bg-slate-100 ${
                 isOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3 md:px-0'
              }`}
           >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                 {initials}
              </div>
              <div className={`text-left min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'flex-1 opacity-100' : 'w-0 opacity-0 md:w-0'}`}>
                 <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                    {displayName || "Guest User"}
                 </p>
                 <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                    {user?.email || "Manage account"}
                 </p>
              </div>
              <ChevronUp className={`shrink-0 w-4 h-4 text-slate-400 transition-all duration-300 ${!isOpen ? 'w-0 opacity-0 overflow-hidden md:w-0' : 'opacity-100 md:w-4'} ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
           </button>
        </div>
      </div>
    </>
  );
}
