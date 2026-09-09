import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Target, Map, FolderKanban, BookOpen, Bot, LayoutGrid, Settings,
  Briefcase, Radio, LogOut, Code, User, ChevronUp, ShieldCheck, Trophy, X, Compass, Activity
} from 'lucide-react';
import { getUser, clearSession } from '../utils/auth';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  route: string;
}

const primaryNav: NavItem[] = [
  { label: 'Overview', icon: <Compass className="w-5 h-5" />, route: '/dashboard' },
  { label: 'My Roadmap', icon: <Map className="w-5 h-5" />, route: '/roadmap' },
  { label: 'Projects', icon: <FolderKanban className="w-5 h-5" />, route: '/projects' },
  { label: 'Interview Practice', icon: <Radio className="w-5 h-5" />, route: '/interview-guide' },
  { label: 'Portfolio', icon: <Briefcase className="w-5 h-5" />, route: '/portfolio' },
  { label: 'Resources', icon: <BookOpen className="w-5 h-5" />, route: '/resources' },
];

const secondaryNav: NavItem[] = [
  { label: 'Missions & Achievements', icon: <Trophy className="w-5 h-5" />, route: '/missions' },
  { label: 'Career Tracks', icon: <Target className="w-5 h-5" />, route: '/workspaces' },
  { label: 'AI Assistant', icon: <Bot className="w-5 h-5" />, route: '/ai-assistant' },
  { label: 'Tools & Utilities', icon: <LayoutGrid className="w-5 h-5" />, route: '/tools' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, route: '/settings' },
];

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Focus management and scroll locking for mobile drawer
  useEffect(() => {
    if (window.innerWidth >= 768) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Basic focus trap could go here
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSignOut = () => {
    clearSession();
    window.location.href = '/signin';
  };

  const user: any = (getUser() ?? {});
  const displayName = user?.name || user?.username || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  const isActive = (route: string) => {
    if (activePage) return route.includes(activePage);
    return location.pathname.startsWith(route);
  };

  const renderNavLinks = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(item.route);
        return (
          <li key={item.route}>
            <button
              onClick={() => {
                navigate(item.route);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                active 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* CSS adjustments for the body when sidebar is present */}
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 240px !important; }
        }
        @media (max-width: 767px) {
          body { padding-top: 4rem !important; }
        }
      `}</style>

      {/* ── Mobile Header Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-[15px]">FindStreak</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 z-[45] backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <nav
        ref={sidebarRef}
        aria-label="Main Navigation"
        className={`fixed top-0 left-0 h-full bg-white z-50 w-64 md:w-[240px] flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">FindStreak</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary</h3>
            {renderNavLinks(primaryNav)}
          </div>
          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Secondary</h3>
            {renderNavLinks(secondaryNav)}
          </div>
        </div>

        {/* User Account Area */}
        <div className="p-3 border-t border-slate-200 shrink-0 relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Pro Member</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
                <button
                  onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
