import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BarChart2, MessageSquare, Activity, Shield, Mail, Trash2,
  RefreshCw, Check, X, Search, ChevronLeft, ChevronRight, Eye,
  TrendingUp, Zap, BookOpen, Trophy, AlertCircle, Send, Bell,
  Cpu, Database, Server, CheckCircle2, Clock, Globe, LogOut,
  AlertTriangle, Info, XCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { apiFetch } from '../utils/apiFetch';

const ADMIN_TOKEN_KEY = 'findstreak_admin_token';

const COLORS = ['#10b981', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#84cc16', '#f97316'];

// ─── Toast System ─────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; message: string; type: ToastType; }

const ToastContainer = ({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) => {
  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };
  const iconColors = { success: 'text-emerald-500', error: 'text-rose-500', warning: 'text-amber-500', info: 'text-indigo-500' };
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold pointer-events-auto animate-in slide-in-from-right-5 ${colors[t.type]}`}>
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconColors[t.type]}`} />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
};

// ─── Confirm Delete Modal ──────────────────────────────────────────────
const ConfirmDeleteModal = ({ user, onConfirm, onCancel }: { user: any; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-rose-100 overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg">Delete User Account</h3>
            <p className="text-rose-100 text-xs">This action cannot be undone</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          All data for this user — including projects, roadmap progress, quiz history, chat sessions, and achievements — will be <strong className="text-rose-600">permanently deleted</strong> from the database.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-md">
            <Trash2 className="w-4 h-4" /> Yes, Delete Permanently
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'emerald' }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200',
    sky: 'bg-sky-50 text-sky-600 border-sky-200',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.emerald}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value?.toLocaleString() ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }: any) => (
  <div className="mb-4">
    <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'slate' }: any) => {
  const map: any = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[color] || map.slate}`}>{children}</span>;
};

// ─── User Detail Modal ───────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose, token }: any) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setDetail(d); setCredits(d.user?.ai_credits ?? 0); }).finally(() => setLoading(false));
  }, [userId, token]);

  const updateCredits = async () => {
    await apiFetch(`/api/admin/user/${userId}/credits`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ credits: parseInt(credits) })
    });
    alert('Credits updated!');
  };

  const sendEmail = async () => {
    setSending(true);
    await apiFetch('/api/admin/email-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ toEmail: detail?.user?.email, subject: emailSubject, message: emailMsg })
    });
    setSending(false);
    setEmailSubject(''); setEmailMsg('');
    alert('Email sent!');
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl"><RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto" /></div>
    </div>
  );

  const u = detail?.user;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-2xl">
              {u?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h3 className="font-black text-xl">{u?.username}</h3>
              <p className="text-slate-300 text-sm">{u?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {u?.onboarding_completed ? <Badge color="green">Onboarded</Badge> : <Badge color="amber">Pending</Badge>}
                {u?.is_admin && <Badge color="indigo">Admin</Badge>}
                <Badge color="slate">{u?.location || 'Global'}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-b">
          {[
            { label: 'AI Credits', val: u?.ai_credits ?? 0 },
            { label: 'Streak', val: `${u?.current_streak ?? 0} days` },
            { label: 'Projects', val: detail?.projects?.length ?? 0 },
            { label: 'Topics Done', val: detail?.roadmapProgress?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">{s.label}</p>
              <p className="text-xl font-black text-slate-900">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Adjust Credits */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adjust AI Credits</p>
            <div className="flex gap-2">
              <input type="number" value={credits} onChange={e => setCredits(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              <button onClick={updateCredits}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                Save
              </button>
            </div>
          </div>
          {/* Send Email */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Send Email to User</p>
            <input type="text" placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <input type="text" placeholder="Message..." value={emailMsg} onChange={e => setEmailMsg(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              <button onClick={sendEmail} disabled={sending}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Projects */}
          {detail?.projects?.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Projects</p>
              <div className="space-y-1.5">
                {detail.projects.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">{p.title}</span>
                    <Badge color={p.status === 'completed' ? 'green' : 'amber'}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Achievements */}
          {detail?.achievements?.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Achievements ({detail.achievements.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.achievements.map((a: any) => (
                  <span key={a.achievement_id} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">
                    🏆 {a.achievement_id.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  const adminEmail = sessionStorage.getItem('adminEmail') || '';

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [signupTrends, setSignupTrends] = useState<any[]>([]);
  const [topRoles, setTopRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // Toast & confirm modal state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // Guard: admin token required
  useEffect(() => {
    if (!adminToken) { navigate('/admin-login'); return; }
  }, [adminToken, navigate]);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [statsRes, trendsRes, rolesRes, feedbackRes, activityRes, healthRes] = await Promise.all([
        apiFetch('/api/admin/stats', { headers }).then(r => r.json()),
        apiFetch('/api/admin/signup-trends', { headers }).then(r => r.json()),
        apiFetch('/api/admin/top-roles', { headers }).then(r => r.json()),
        apiFetch('/api/admin/feedback', { headers }).then(r => r.json()),
        apiFetch('/api/admin/activity', { headers }).then(r => r.json()),
        apiFetch('/api/admin/system-health', { headers }).then(r => r.json()),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (trendsRes.success) setSignupTrends(trendsRes.trends.map((t: any) => ({ date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: parseInt(t.count) })));
      if (rolesRes.success) setTopRoles(rolesRes.roles.map((r: any) => ({ role: r.role.substring(0, 22), count: parseInt(r.count) })));
      if (feedbackRes.success) setFeedback(feedbackRes.feedback);
      if (activityRes.success) setActivity(activityRes.activity);
      if (healthRes.success) setHealth(healthRes.health);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminToken]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/admin/users?page=${userPage}&limit=15&search=${userSearch}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      }).then(r => r.json());
      if (res.success) {
        setUsers(res.users);
        setUserTotal(res.total);
        setUserPages(res.pages);
      }
    } catch (err) {
      console.error('Users fetch error:', err);
    }
  }, [adminToken, userPage, userSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [fetchUsers, activeTab]);

  // Real-time refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => { fetchData(); if (activeTab === 'users') fetchUsers(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchUsers, activeTab]);

  const deleteUser = async (id: number) => {
    await apiFetch(`/api/admin/user/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
    setDeleteTarget(null);
    showToast('User deleted permanently.', 'success');
    fetchUsers();
  };

  const resolveFeedback = async (id: number, status: string) => {
    await apiFetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status })
    });
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    showToast(status === 'resolved' ? 'Feedback marked as resolved.' : 'Feedback reopened.', 'info');
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    const res = await apiFetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ subject: broadcastSubject, message: broadcastMsg })
    }).then(r => r.json());
    setBroadcasting(false);
    setBroadcastResult(`Sent to ${res.sent ?? 0} users`);
    showToast(`✅ Broadcast sent to ${res.sent ?? 0} users!`, 'success');
    setBroadcastMsg(''); setBroadcastSubject('');
  };

  if (!adminToken) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'activity', label: 'Live Activity', icon: Activity },
    { id: 'broadcast', label: 'Broadcast', icon: Mail },
    { id: 'health', label: 'System', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
          onConfirm={() => deleteUser(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {selectedUser && <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} token={adminToken} />}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base tracking-tight">FindStreak Admin</h1>
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-600 font-bold">Live</span>
              </span>
              <span className="text-slate-300">·</span>
              {stats?.totalUsers ?? '—'} users · {adminEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchData(); if (activeTab === 'users') fetchUsers(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => {
            sessionStorage.removeItem('findstreak_admin_token');
            sessionStorage.removeItem('adminEmail');
            navigate('/admin-login');
          }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-0 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.id === 'feedback' && feedback.filter(f => f.status === 'open').length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-black">
                {feedback.filter(f => f.status === 'open').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} sub={`+${stats?.newToday} today`} color="emerald" />
                  <StatCard icon={TrendingUp} label="New This Week" value={stats?.newWeek} sub={`+${stats?.newMonth} this month`} color="teal" />
                  <StatCard icon={BookOpen} label="Roadmaps Generated" value={stats?.totalRoadmaps} color="indigo" />
                  <StatCard icon={Trophy} label="Projects Started" value={stats?.totalProjects} color="amber" />
                  <StatCard icon={Zap} label="Quiz Attempts" value={stats?.totalQuiz} color="violet" />
                  <StatCard icon={MessageSquare} label="AI Chat Sessions" value={stats?.totalChats} color="sky" />
                  <StatCard icon={AlertCircle} label="Feedback Reports" value={stats?.totalFeedback} color="rose" />
                  <StatCard icon={CheckCircle2} label="Onboarded Users" value={stats?.onboardedUsers} sub={`${stats?.totalUsers ? Math.round((stats.onboardedUsers / stats.totalUsers) * 100) : 0}% of total`} color="emerald" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Signup Trend */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <SectionHeader title="User Signups (Last 30 Days)" subtitle="Daily registration count" />
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={signupTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Roles */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <SectionHeader title="Top Roles Chosen" subtitle="Most popular career paths" />
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topRoles} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="role" type="category" tick={{ fontSize: 9 }} width={120} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {topRoles.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Feature Usage Pie */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <SectionHeader title="Platform Feature Usage" subtitle="Relative engagement across features" />
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <ResponsiveContainer width={260} height={200}>
                      <PieChart>
                        <Pie data={[
                          { name: 'Roadmaps', value: stats?.totalRoadmaps || 0 },
                          { name: 'Projects', value: stats?.totalProjects || 0 },
                          { name: 'AI Chats', value: stats?.totalChats || 0 },
                          { name: 'Quizzes', value: stats?.totalQuiz || 0 },
                          { name: 'Feedback', value: stats?.totalFeedback || 0 },
                        ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {[
                        { label: 'Roadmaps', val: stats?.totalRoadmaps, color: 'emerald' },
                        { label: 'Projects', val: stats?.totalProjects, color: 'teal' },
                        { label: 'AI Chats', val: stats?.totalChats, color: 'indigo' },
                        { label: 'Quizzes', val: stats?.totalQuiz, color: 'amber' },
                        { label: 'Feedback', val: stats?.totalFeedback, color: 'rose' },
                        { label: 'AI Credits Used', val: stats?.creditsUsed, color: 'violet' },
                      ].map(f => (
                        <div key={f.label} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className={`w-2 h-8 rounded-full bg-${f.color}-500`} />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{f.label}</p>
                            <p className="text-xl font-black text-slate-900">{(f.val || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <SectionHeader title={`All Users (${userTotal.toLocaleString()})`} subtitle="Search, view, manage and delete users" />
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by email or username..."
                  value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="flex-1 text-sm bg-transparent focus:outline-none" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['User', 'Role', 'Joined', 'Streak', 'Credits', 'Projects', 'Topics', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {u.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{u.username}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[120px] truncate">{u.current_role || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs font-bold text-emerald-600">{u.current_streak ?? 0}🔥</td>
                        <td className="px-4 py-3 text-xs font-bold text-indigo-600">{u.ai_credits ?? 0}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{u.project_count ?? 0}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{u.topics_done ?? 0}</td>
                        <td className="px-4 py-3">
                          {u.onboarding_completed
                            ? <Badge color="green">Active</Badge>
                            : <Badge color="amber">Onboarding</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedUser(u.id)}
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="View Details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget(u)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors" title="Delete User">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Page {userPage} of {userPages} · {userTotal} total users</p>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                    className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setUserPage(p => Math.min(userPages, p + 1))} disabled={userPage === userPages}
                    className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <SectionHeader title="Feedback & Bug Reports" subtitle="All user-submitted feedback from the in-app widget" />
            {feedback.length === 0
              ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm"><MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No feedback yet</p></div>
              : (
                <div className="space-y-3">
                  {feedback.map(f => (
                    <div key={f.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${f.status === 'resolved' ? 'border-emerald-200 opacity-70' : 'border-slate-100'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-slate-900">{f.name || f.username || 'Anonymous'}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400">{f.user_email || f.email || '—'}</span>
                            <Badge color={f.status === 'resolved' ? 'green' : 'amber'}>{f.status}</Badge>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">{f.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-slate-400">📍 {f.page_path || 'Unknown page'}</span>
                            <span className="text-[10px] text-slate-400">🕐 {new Date(f.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {f.status !== 'resolved' && (
                            <button onClick={() => resolveFeedback(f.id, 'resolved')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                              <Check className="w-3 h-3" /> Resolve
                            </button>
                          )}
                          {f.status === 'resolved' && (
                            <button onClick={() => resolveFeedback(f.id, 'open')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                              <X className="w-3 h-3" /> Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── LIVE ACTIVITY ── */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Real-Time Activity Feed" subtitle="Latest platform events across all users" />
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Auto-refreshes every 30s
              </span>
            </div>
            {activity.length === 0
              ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm"><Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No recent activity</p></div>
              : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                  {activity.map((a, i) => {
                    const typeMap: any = {
                      signup: { icon: Users, color: 'text-emerald-600 bg-emerald-50', label: '🟢' },
                      project: { icon: Trophy, color: 'text-amber-600 bg-amber-50', label: '🚀' },
                      roadmap: { icon: BookOpen, color: 'text-indigo-600 bg-indigo-50', label: '✅' },
                      feedback: { icon: MessageSquare, color: 'text-rose-600 bg-rose-50', label: '💬' },
                    };
                    const t = typeMap[a.type] || typeMap.signup;
                    return (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${t.color} flex-shrink-0`}>
                          {t.label}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{a.text}</p>
                          <p className="text-[10px] text-slate-400">{a.time ? new Date(a.time).toLocaleString() : '—'}</p>
                        </div>
                        <Badge color={a.type === 'signup' ? 'green' : a.type === 'feedback' ? 'red' : 'slate'}>
                          {a.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ── BROADCAST ── */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 max-w-2xl">
            <SectionHeader title="Broadcast Email" subtitle="Send an email to all verified users on the platform" />
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Subject</label>
                <input type="text" placeholder="e.g. Important Update from FindStreak" value={broadcastSubject}
                  onChange={e => setBroadcastSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Message</label>
                <textarea placeholder="Write your message here..." value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)} rows={6}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              {broadcastResult && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> {broadcastResult}
                </div>
              )}
              <button onClick={sendBroadcast} disabled={broadcasting || !broadcastMsg.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {broadcasting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send to All Users</>}
              </button>
              <p className="text-xs text-slate-400 text-center">⚠️ This will send to all registered users. Use with care.</p>
            </div>

            {/* Notification alert */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <SectionHeader title="Quick Admin Alert" subtitle="Send yourself an alert email" />
              <div className="flex gap-2">
                <input type="text" placeholder="Alert message..." id="alertMsg"
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" />
                <button onClick={async () => {
                  const msg = (document.getElementById('alertMsg') as HTMLInputElement)?.value;
                  if (!msg) return;
                  await apiFetch('/api/admin/notify-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                    body: JSON.stringify({ subject: '[FindStreak] Admin Alert', message: msg })
                  });
                  showToast('Alert email sent to admin!', 'success');
                  (document.getElementById('alertMsg') as HTMLInputElement).value = '';
                }}
                  className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Send Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SYSTEM HEALTH ── */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <SectionHeader title="System Health" subtitle="Server and database status for Railway deployment" />
            {health ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Server, label: 'Server Uptime', value: `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`, color: 'emerald' },
                  { icon: Database, label: 'DB Latency', value: health.dbLatency >= 0 ? `${health.dbLatency}ms` : 'Error', color: health.dbLatency < 0 ? 'rose' : 'teal' },
                  { icon: Cpu, label: 'Memory Usage', value: `${health.memoryMB} MB`, color: health.memoryMB > 400 ? 'amber' : 'indigo' },
                  { icon: Globe, label: 'Environment', value: health.env, color: 'slate' },
                  { icon: CheckCircle2, label: 'DB Status', value: health.dbStatus, color: health.dbStatus === 'healthy' ? 'emerald' : 'rose' },
                  { icon: Clock, label: 'Node.js', value: health.nodeVersion, color: 'slate' },
                ].map(s => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />)}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-emerald-500" /></div>
            )}

            {/* API Health check button */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <SectionHeader title="Manual Health Check" subtitle="Ping the API and database" />
              <div className="flex gap-3">
                {[
                  { label: 'Ping API', url: '/api/health' },
                  { label: 'Ping DB', url: '/api/health/db' },
                ].map(btn => (
                  <button key={btn.label} onClick={async () => {
                    try {
                      const res = await fetch(btn.url, { headers: { Authorization: `Bearer ${adminToken}` } }).then(r => r.json());
                      showToast(`${btn.label}: ${JSON.stringify(res)}`, 'info');
                    } catch { showToast('Ping failed', 'error'); }
                  }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                    {btn.label}
                  </button>
                ))}
                <button onClick={() => fetchData()}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Health
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
