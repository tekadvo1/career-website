import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Briefcase,
  Target,
  BarChart3,
  FolderKanban,
  BookOpen,
  LayoutGrid,
  Bot,
  Settings,
  ChevronUp,
  Code,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react';
import { getUser, clearSession } from '../utils/auth';

interface NavItem {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
}

interface SidebarProps {
  activePage?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Browse Projects',
    subtitle: 'AI-recommended for you',
    icon: <BarChart3 className="w-5 h-5" />,
    route: '/dashboard',
  },
  {
    label: 'My Career Tracks',
    subtitle: 'Switch between careers',
    icon: <Briefcase className="w-5 h-5" />,
    route: '/workspaces',
    badge: 'NEW',
  },
  {
    label: 'Learning Roadmap',
    subtitle: 'Track your progress',
    icon: <Target className="w-5 h-5" />,
    route: '/roadmap',
  },
  {
    label: 'My Active Projects',
    subtitle: 'View projects in progress',
    icon: <FolderKanban className="w-5 h-5" />,
    route: '/my-projects',
  },
  {
    label: 'Study Materials',
    subtitle: 'Guides & resources',
    icon: <BookOpen className="w-5 h-5" />,
    route: '/resources',
  },
  {
    label: 'Ask AI Anything',
    subtitle: 'Get instant help',
    icon: <Bot className="w-5 h-5" />,
    route: '/ai-assistant',
  },
  {
    label: 'Tools',
    subtitle: 'Extra features & utilities',
    icon: <LayoutGrid className="w-5 h-5" />,
    route: '/tools',
  },
  {
    label: 'How It Works',
    subtitle: 'Quick start guide',
    icon: <HelpCircle className="w-5 h-5" />,
    route: '/getting-started',
    badge: 'GUIDE',
  },
];

export default function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [clearedBadges, setClearedBadges] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('findstreak_cleared_badges');
      if (stored) {
        Promise.resolve().then(() => setClearedBadges(JSON.parse(stored)));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const last = localStorage.getItem('lastRoleAnalysis') || sessionStorage.getItem('lastRoleAnalysis');
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed.role) {
          const clean = parsed.role.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
          setCurrentRole(clean);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleClearBadge = (route: string) => {
    if (!clearedBadges.includes(route)) {
      const next = [...clearedBadges, route];
      setClearedBadges(next);
      localStorage.setItem('findstreak_cleared_badges', JSON.stringify(next));
    }
  };

  const handleSignOut = () => {
    clearSession();
    window.location.href = '/signin';
  };

  const user: any = (getUser() ?? {});
  const displayName = user?.name || user?.username || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  const isActive = (route: string) => {
    if (activePage) return route.includes(activePage);
    return location.pathname === route;
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 5rem !important; }
        }
        @media (max-width: 767px) {
          body { padding-top: 4rem !important; }
          .sticky.top-0 { top: 4rem !important; }
        }
      `}</style>

      {/* ── Mobile Header Bar ── */}
      {!isOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-[4rem] bg-white border-b border-slate-100 z-[60] flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-slate-800 tracking-tight text-[15px]">FindStreak</span>
            </div>
          </div>
          {currentRole && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full truncate max-w-[130px]">
              🎯 {currentRole}
            </span>
          )}
          <button
            onClick={() => navigate('/profile', { state: { readOnlyMode: true } })}
            className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold"
          >
            {initials}
          </button>
        </div>
      )}

      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`fixed top-0 left-0 h-full bg-white z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-100 overflow-hidden ${
          isOpen ? 'w-72 translate-x-0 shadow-2xl' : 'w-72 -translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Logo + Toggle */}
        <div className={`flex items-center border-b border-slate-100 flex-shrink-0 h-16 ${isOpen ? 'px-4 justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 md:hidden'}`}>
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[13px] font-extrabold text-slate-900 leading-tight">FindStreak</h2>
              <p className="text-[9px] text-slate-400 font-medium">Career Growth Platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              : <svg className="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            }
          </button>
        </div>

        {/* Current Goal Badge — visible only when expanded */}
        {currentRole && isOpen && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 flex-shrink-0">
            <span className="text-base flex-shrink-0">🎯</span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-0.5">Your Current Goal</p>
              <p className="text-[12px] font-bold text-slate-800 truncate">{currentRole}</p>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.route);
            const showBadge = item.badge && !clearedBadges.includes(item.route);
            return (
              <button
                key={item.route}
                title={!isOpen ? item.label : undefined}
                onClick={() => {
                  if (item.badge) handleClearBadge(item.route);
                  if (window.innerWidth < 768) setIsOpen(false);
                  navigate(item.route);
                }}
                className={`w-full flex items-center transition-all group relative ${
                  isOpen
                    ? `gap-3 px-3 mx-0 py-2 rounded-xl ${active ? 'bg-emerald-50 text-emerald-700 ml-0' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                    : `justify-center py-3 ${active ? 'border-r-4 border-emerald-500 bg-emerald-50' : 'border-r-4 border-transparent hover:bg-slate-50'}`
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors [&>svg]:w-4 [&>svg]:h-4 ${
                  active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                }`}>
                  {item.icon}
                </div>

                {/* Text (only when open) */}
                <div className={`text-left min-w-0 flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-[13px] leading-tight truncate ${active ? 'text-emerald-700' : 'text-slate-800 group-hover:text-emerald-700'}`}>
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="flex-shrink-0 px-1.5 py-[2px] bg-emerald-500 text-white text-[9px] font-bold rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${active ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Active dot for collapsed mode */}
                {!isOpen && active && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Footer */}
        <div className="border-t border-slate-100 flex-shrink-0 bg-white">
          {/* Profile Menu Options */}
          <div className={`overflow-hidden transition-all duration-300 ${isProfileMenuOpen && isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => { if (window.innerWidth < 768) setIsOpen(false); navigate('/profile', { state: { readOnlyMode: true } }); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors font-medium"
              >
                <User className="w-4 h-4 text-slate-400" />
                View My Profile
              </button>
              <button
                onClick={() => { if (window.innerWidth < 768) setIsOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Account Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Profile Trigger */}
          <button
            onClick={() => {
              if (!isOpen) { setIsOpen(true); setIsProfileMenuOpen(true); }
              else { setIsProfileMenuOpen(!isProfileMenuOpen); }
            }}
            title={!isOpen ? 'Profile menu' : undefined}
            className={`w-full flex items-center transition-colors hover:bg-slate-50 ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3'}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm">
              {initials}
            </div>
            <div className={`text-left min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'flex-1 opacity-100' : 'w-0 opacity-0 md:w-0'}`}>
              <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{user?.email || 'Manage account'}</p>
            </div>
            <ChevronUp className={`shrink-0 w-4 h-4 text-slate-400 transition-all duration-300 ${!isOpen ? 'w-0 opacity-0' : 'opacity-100'} ${isProfileMenuOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    </>
  );
}
