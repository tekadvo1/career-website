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
  Code,
  MessageSquare,
  Terminal,
  Settings,
  LogOut,
  ChevronUp,
  Shield,
  AlertTriangle
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
    route: '/quiz-game',
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
  {
    label: 'Tech Stack & Tools',
    subtitle: 'AI trending analysis',
    icon: <Terminal className="w-5 h-5 text-emerald-600" />,
    route: '/tech-stack',
    badge: 'NEW',
  },
  // {
  //   label: 'AI Portfolio Builder',
  //   subtitle: 'Recruiter ready site',
  //   icon: <Globe className="w-5 h-5 text-emerald-600" />,
  //   route: '/portfolio',
  //   badge: 'NEW',
  // },
  {
    label: 'Interview Guide',
    subtitle: 'AI Prep & Q&A',
    icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
    route: '/interview-guide',
    badge: 'NEW',
  },
  // {
  //   label: 'Project Structure',
  //   subtitle: 'AI architecture guide',
  //   icon: <FolderTree className="w-5 h-5 text-emerald-600" />,
  //   route: '/project-structure',
  //   badge: 'NEW',
  // },
];

export default function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user: any = (getUser() ?? {});
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G";
  
  const handleLogout = () => {
    sessionStorage.removeItem('token'); 
    sessionStorage.removeItem('user');
    window.location.href = '/signin';
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
          className="fixed top-2.5 left-2.5 md:top-4 md:left-4 z-50 p-2 md:p-2.5 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-sm border border-slate-200"
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

        {/* Footer with User Actions */}
        <div className="border-t border-slate-200 flex-shrink-0 bg-slate-50 relative">
           
           {/* Expandable Menu */}
           <div className={`absolute bottom-full left-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out overflow-hidden ${isProfileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-2 space-y-1 my-1">
                 <button 
                   onClick={() => { setIsOpen(false); navigate('/profile'); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   <User className="w-4 h-4 text-slate-500" />
                   View Full Profile
                 </button>
                 <button 
                   onClick={() => { setIsOpen(false); navigate('/settings'); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   <Settings className="w-4 h-4 text-slate-500" />
                   Account Settings
                 </button>
                 <button 
                   onClick={() => { setIsOpen(false); navigate('/settings'); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   <Shield className="w-4 h-4 text-slate-500" />
                   Privacy & Visibility
                 </button>
                 <div className="h-px bg-slate-200 my-1 mx-2" />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); setIsOpen(false); }}
                   className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                 >
                   <LogOut className="w-4 h-4 text-red-500" />
                   Log Out
                 </button>
              </div>
           </div>

           {/* User Profile Trigger Bar */}
           <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors"
           >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                 {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                 <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                    {user?.name || user?.username || "Guest User"}
                 </p>
                 <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                    {user?.email || "Manage account"}
                 </p>
              </div>
              <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
           </button>
        </div>
      </div>

      {/* Sidebar Logout Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowLogoutModal(false)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8 text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to leave?</h3>
               <p className="text-sm text-slate-500 px-4">
                 Are you sure you want to log out of your FindStreak account? You will need to sign in again to access your learning workspaces.
               </p>
             </div>
             <div className="flex border-t border-slate-100">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 p-4 font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 p-4 font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Yes, Log Out
                </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
}
