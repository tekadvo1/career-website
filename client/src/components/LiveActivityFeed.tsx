import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Zap,
  Flame,
  CheckCircle2,
  Trophy,
  FolderOpen,
  Target,
  Star,
  TrendingUp,
  Radio,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Circle,
  BookOpen,
} from 'lucide-react';

/* ─── Activity event types ──────────────────────────────────────────────────── */
export type ActivityEventType =
  | 'task_complete'
  | 'xp_gain'
  | 'streak_update'
  | 'project_started'
  | 'project_completed'
  | 'mission_complete'
  | 'achievement'
  | 'roadmap_progress'
  | 'connected';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  subtitle?: string;
  value?: string | number;
  timestamp: Date;
  isNew?: boolean;
}

/* ─── Icon + colour config per event type ─────────────────────────────────── */
const EVENT_CONFIG: Record<
  ActivityEventType,
  { icon: React.ReactNode; bg: string; ring: string; text: string; dot: string }
> = {
  task_complete: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  xp_gain: {
    icon: <Zap className="w-3.5 h-3.5" />,
    bg: 'bg-amber-500',
    ring: 'ring-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  streak_update: {
    icon: <Flame className="w-3.5 h-3.5" />,
    bg: 'bg-orange-500',
    ring: 'ring-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  project_started: {
    icon: <FolderOpen className="w-3.5 h-3.5" />,
    bg: 'bg-blue-500',
    ring: 'ring-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  project_completed: {
    icon: <Trophy className="w-3.5 h-3.5" />,
    bg: 'bg-purple-500',
    ring: 'ring-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  mission_complete: {
    icon: <Target className="w-3.5 h-3.5" />,
    bg: 'bg-rose-500',
    ring: 'ring-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  achievement: {
    icon: <Star className="w-3.5 h-3.5" />,
    bg: 'bg-yellow-500',
    ring: 'ring-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  roadmap_progress: {
    icon: <BookOpen className="w-3.5 h-3.5" />,
    bg: 'bg-teal-500',
    ring: 'ring-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  connected: {
    icon: <Radio className="w-3.5 h-3.5" />,
    bg: 'bg-slate-500',
    ring: 'ring-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatRelTime(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 5)  return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

/* ─── Snapshot shape (matches realtimeRoutes.js) ─────────────────────────── */
interface Snapshot {
  totalXP: number;
  totalStreak: number;
  activeCount: number;
  completedCount: number;
  projects: Array<{ id: string; status?: string; title: string; progress_data?: any }>;
  missions: Array<{ status?: string; title?: string; name?: string; xp_reward?: number }>;
  roadmapProgress: Array<{ role: string; topic_name: string }>;
  timestamp: string;
}

/* ─── Props ───────────────────────────────────────────────────────────────── */
interface LiveActivityFeedProps {
  isLive: boolean;
  snapshot: Snapshot | null;
  className?: string;
  defaultCollapsed?: boolean;
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function LiveActivityFeed({
  isLive,
  snapshot,
  className = '',
  defaultCollapsed = false,
}: LiveActivityFeedProps) {
  const [events, setEvents]         = useState<ActivityEvent[]>([]);
  const [collapsed, setCollapsed]   = useState(defaultCollapsed);
  const [newCount, setNewCount]     = useState(0);
  const prevSnap                    = useRef<Snapshot | null>(null);
  const listRef                     = useRef<HTMLDivElement>(null);

  /* ── Generate synthetic "connected" event once live ───────────────────── */
  useEffect(() => {
    if (isLive) {
      setEvents(prev => {
        // Only add once — don't duplicate on SSE reconnects
        if (prev.some(e => e.type === 'connected')) return prev;
        return [{
          id: makeId(),
          type: 'connected' as ActivityEventType,
          title: 'Live feed connected',
          subtitle: 'Real-time updates active',
          timestamp: new Date(),
          isNew: true,
        }, ...prev];
      });
    }
  }, [isLive]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Diff snapshots to produce events ────────────────────────────────── */
  const diffAndPush = useCallback((prev: Snapshot | null, next: Snapshot) => {
    const newEvts: Omit<ActivityEvent, 'id' | 'timestamp' | 'isNew'>[] = [];

    if (prev) {
      // XP gain
      const xpDelta = next.totalXP - prev.totalXP;
      if (xpDelta > 0) {
        newEvts.push({
          type: 'xp_gain',
          title: `+${xpDelta} XP earned`,
          subtitle: 'Keep up the momentum!',
          value: xpDelta,
        });
      }

      // Streak update
      if (next.totalStreak > prev.totalStreak) {
        newEvts.push({
          type: 'streak_update',
          title: `${next.totalStreak}-day streak! 🔥`,
          subtitle: 'Your daily streak is on fire',
          value: next.totalStreak,
        });
      }

      // New projects started
      const prevIds = new Set((prev.projects || []).map(p => String(p.id)));
      (next.projects || []).forEach(p => {
        if (!prevIds.has(String(p.id)) && p.status === 'active') {
          newEvts.push({
            type: 'project_started',
            title: `Started "${p.title}"`,
            subtitle: 'Project workspace activated',
          });
        }
      });

      // Project completions
      const prevCompleted = new Set(
        (prev.projects || []).filter(p => p.status === 'completed').map(p => String(p.id))
      );
      (next.projects || []).filter(p => p.status === 'completed').forEach(p => {
        if (!prevCompleted.has(String(p.id))) {
          newEvts.push({
            type: 'project_completed',
            title: `Completed "${p.title}"`,
            subtitle: 'Outstanding work!',
          });
        }
      });

      // Task completions (from progress_data diffs)
      (next.projects || []).forEach(nextProj => {
        const prevProj = (prev.projects || []).find(p => String(p.id) === String(nextProj.id));
        const prevTasks = prevProj?.progress_data?.completedTasks?.length ?? 0;
        const nextTasks = nextProj?.progress_data?.completedTasks?.length ?? 0;
        if (nextTasks > prevTasks) {
          const delta = nextTasks - prevTasks;
          newEvts.push({
            type: 'task_complete',
            title: `${delta} task${delta > 1 ? 's' : ''} completed`,
            subtitle: nextProj.title,
            value: nextTasks,
          });
        }
      });

      // Mission completions
      const prevMissionsDone = new Set(
        (prev.missions || []).filter(m => m.status === 'completed').map(m => m.title || m.name || '')
      );
      (next.missions || []).filter(m => m.status === 'completed').forEach(m => {
        const key = m.title || m.name || '';
        if (key && !prevMissionsDone.has(key)) {
          newEvts.push({
            type: 'mission_complete',
            title: `Mission complete: ${key}`,
            subtitle: m.xp_reward ? `+${m.xp_reward} XP rewarded` : 'Daily mission done',
            value: m.xp_reward,
          });
        }
      });

      // Roadmap progress
      const prevTopics = new Set(
        (prev.roadmapProgress || []).map(r => `${r.role}::${r.topic_name}`)
      );
      (next.roadmapProgress || []).forEach(r => {
        const key = `${r.role}::${r.topic_name}`;
        if (!prevTopics.has(key)) {
          newEvts.push({
            type: 'roadmap_progress',
            title: `Roadmap: "${r.topic_name}"`,
            subtitle: `${r.role} path`,
          });
        }
      });
    } else {
      // First snapshot — seed with summary events
      if (next.totalStreak > 0) {
        newEvts.push({
          type: 'streak_update',
          title: `${next.totalStreak}-day active streak`,
          subtitle: 'Keep it going!',
          value: next.totalStreak,
        });
      }
      if (next.totalXP > 0) {
        newEvts.push({
          type: 'xp_gain',
          title: `${next.totalXP} total XP`,
          subtitle: 'Your current score',
          value: next.totalXP,
        });
      }
      if (next.activeCount > 0) {
        newEvts.push({
          type: 'project_started',
          title: `${next.activeCount} active project${next.activeCount > 1 ? 's' : ''}`,
          subtitle: 'In progress',
        });
      }
      if (next.completedCount > 0) {
        newEvts.push({
          type: 'project_completed',
          title: `${next.completedCount} project${next.completedCount > 1 ? 's' : ''} completed`,
          subtitle: 'All-time',
        });
      }
    }

    if (newEvts.length > 0) {
      const ts = new Date();
      const built: ActivityEvent[] = newEvts.map(e => ({
        ...e,
        id: makeId(),
        timestamp: ts,
        isNew: true,
      }));
      setEvents(prev => {
        const combined = [...built, ...prev].slice(0, 50); // cap at 50
        return combined;
      });
      if (collapsed) setNewCount(c => c + newEvts.length);
      // Auto-scroll to top
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
      }, 50);
    }
  }, [collapsed]);

  /* ── Watch snapshot changes ─────────────────────────────────────────── */
  useEffect(() => {
    if (!snapshot) return;
    diffAndPush(prevSnap.current, snapshot);
    prevSnap.current = snapshot;
  }, [snapshot, diffAndPush]);

  /* ── Clear isNew flag after animation ──────────────────────────────── */
  useEffect(() => {
    if (events.some(e => e.isNew)) {
      const t = setTimeout(() => {
        setEvents(prev => prev.map(e => ({ ...e, isNew: false })));
      }, 800);
      return () => clearTimeout(t);
    }
  }, [events]);

  /* ── Open panel → clear new count ──────────────────────────────────── */
  const handleToggle = () => {
    setCollapsed(c => !c);
    if (collapsed) setNewCount(0);
  };

  /* ── Relative timestamps tick every 30s ─────────────────────────────── */
  const [, forceRender] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceRender(n => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isLive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Live Activity</span>
            {isLive ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <WifiOff className="w-2.5 h-2.5" />
                Offline
              </span>
            )}
            {collapsed && newCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black animate-bounce">
                {newCount > 9 ? '9+' : newCount}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
          <span className="text-[10px] font-medium">{events.length} events</span>
          {collapsed
            ? <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronUp className="w-3.5 h-3.5" />
          }
        </div>
      </button>

      {/* ── Feed Body ───────────────────────────────────────────────────── */}
      {!collapsed && (
        <div
          ref={listRef}
          className="max-h-[340px] overflow-y-auto overscroll-contain divide-y divide-slate-50"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
        >
          {events.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">No activity yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isLive ? 'Complete a task to see events here' : 'Connecting to live feed…'}
                </p>
              </div>
              {!isLive && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ) : (
            events.map((evt) => {
              const cfg = EVENT_CONFIG[evt.type];
              return (
                <div
                  key={evt.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-all duration-500 ${
                    evt.isNew
                      ? 'bg-emerald-50/70 border-l-2 border-emerald-400'
                      : 'hover:bg-slate-50/80 border-l-2 border-transparent'
                  }`}
                  style={{
                    animation: evt.isNew ? 'activitySlideIn 0.4s ease-out' : undefined,
                  }}
                >
                  {/* Icon bubble */}
                  <div className={`w-6 h-6 rounded-full ${cfg.bg} text-white flex items-center justify-center flex-shrink-0 mt-0.5 ring-2 ring-white`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {evt.title}
                    </p>
                    {evt.subtitle && (
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug truncate">
                        {evt.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Value + timestamp */}
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {evt.value !== undefined && (
                      <span className={`text-[9px] font-black ${cfg.text} px-1.5 py-0.5 rounded-full bg-slate-100`}>
                        {typeof evt.value === 'number' && evt.type === 'xp_gain' ? `+${evt.value}` : evt.value}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">
                      {formatRelTime(evt.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Footer — stats strip ────────────────────────────────────────── */}
      {!collapsed && events.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Event type dots legend */}
            {(['task_complete', 'xp_gain', 'streak_update'] as ActivityEventType[]).map(t => (
              <div key={t} className="flex items-center gap-1">
                <Circle className={`w-2 h-2 fill-current ${EVENT_CONFIG[t].text}`} />
                <span className="text-[9px] text-slate-400 capitalize">
                  {t === 'task_complete' ? 'Tasks' : t === 'xp_gain' ? 'XP' : 'Streak'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Sparkles className="w-2.5 h-2.5" />
            Auto-updating
          </div>
        </div>
      )}

      {/* ── CSS animation ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes activitySlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
