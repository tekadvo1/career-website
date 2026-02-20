import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Target,
  Trophy,
  Star,
  Zap,
  Gift,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  Flame,
  Shield,
  Crown,
  BookOpen,
  Code,
  Users,
  TrendingUp,
  Play,
  Plus,
  Loader2
} from 'lucide-react';

interface Mission {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  difficulty: string;
  estimated_time: string;
  steps: string[];
  ai_powered: boolean;
  icon: string;
  action_route: string;
  status: string;
  progress: number;
  xp_earned: number;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  xp_cost: number;
  reward_type: string;
  available: boolean;
}

export default function Missions() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('selectedRole') || 'Software Engineer';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState<'missions' | 'rewards' | 'how_it_works'>('missions');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [startingMission, setStartingMission] = useState<number | null>(null);

  // Fetch missions from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [missionsRes, rewardsRes] = await Promise.all([
          fetch(`/api/missions?role=${encodeURIComponent(role)}&userId=${user.id || ''}`),
          fetch('/api/missions/rewards')
        ]);

        const missionsData = await missionsRes.json();
        const rewardsData = await rewardsRes.json();

        if (missionsData.success) {
          setMissions(missionsData.missions);
          setTotalXp(missionsData.totalXp || 0);
          setCompletedCount(missionsData.completedCount || 0);
          setTotalCount(missionsData.totalCount || 0);
        }

        if (rewardsData.success) {
          setRewards(rewardsData.rewards);
        }
      } catch (e) {
        console.error('Failed to fetch missions:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, user.id]);

  const filteredMissions = missions.filter(m =>
    categoryFilter === 'all' || m.category === categoryFilter
  );

  const totalAvailableXP = missions
    .filter(m => m.status !== 'completed')
    .reduce((acc, m) => acc + m.xp_reward, 0);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      case 'Epic': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'project': return <Code className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      case 'skill': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'learning': return 'text-blue-600 bg-blue-50';
      case 'project': return 'text-indigo-600 bg-indigo-50';
      case 'community': return 'text-orange-600 bg-orange-50';
      case 'skill': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'certification': return <Award className="w-6 h-6" />;
      case 'promocode': return <Gift className="w-6 h-6" />;
      case 'badge': return <Shield className="w-6 h-6" />;
      case 'feature': return <Sparkles className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const handleStartMission = async (mission: Mission) => {
    if (!user.id) {
      navigate('/signin');
      return;
    }

    setStartingMission(mission.id);

    try {
      await fetch('/api/missions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, missionId: mission.id })
      });

      // Update local state
      setMissions(prev => prev.map(m =>
        m.id === mission.id ? { ...m, status: 'in_progress' } : m
      ));
    } catch (e) {
      console.error('Failed to start mission:', e);
    } finally {
      setStartingMission(null);
    }

    // Navigate to the mission's action route
    const route = mission.action_route || '/dashboard';
    navigate(route, { state: { role, fromMission: mission.id } });
  };

  const _handleCompleteMission = async (missionId: number) => {
    if (!user.id) return;

    try {
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, missionId })
      });
      const data = await res.json();

      if (data.success) {
        setTotalXp(data.totalXp);
        setMissions(prev => prev.map(m =>
          m.id === missionId ? { ...m, status: 'completed', xp_earned: data.xpEarned } : m
        ));
        setCompletedCount(prev => prev + 1);
      }
    } catch (e) {
      console.error('Failed to complete mission:', e);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    if (!user.id) return;

    try {
      const res = await fetch('/api/missions/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, rewardId })
      });
      const data = await res.json();

      if (data.success) {
        setTotalXp(data.remainingXp);
        alert(`🎉 Reward redeemed: ${data.reward}! Remaining XP: ${data.remainingXp}`);
      } else {
        alert(data.error || 'Failed to redeem');
      }
    } catch (e) {
      console.error('Failed to redeem reward:', e);
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/missions/generate-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, category: categoryFilter !== 'all' ? categoryFilter : undefined })
      });
      const data = await res.json();

      if (data.success) {
        setMissions(prev => [...prev, ...data.missions]);
        setTotalCount(prev => prev + data.missions.length);
      }
    } catch (e) {
      console.error('Failed to generate missions:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Loading Mission Center</h3>
          <p className="text-slate-400 text-sm">AI is preparing personalized missions for <span className="text-indigo-400 font-semibold">{role}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Mission Center</h1>
                  <p className="text-slate-400 text-sm">
                    AI-curated missions for <span className="text-indigo-400 font-semibold">{role}</span> • powered by real-time data
                  </p>
                </div>
              </div>
            </div>

            {/* XP Stats */}
            <div className="flex gap-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xl font-black text-amber-400">{totalXp}</span>
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total XP</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-xl font-black text-emerald-400">{completedCount}/{totalCount}</span>
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Completed</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center min-w-[90px] hidden md:block">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xl font-black text-orange-400">{totalAvailableXP}</span>
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Available</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progress to next reward tier</span>
              <span className="text-xs text-amber-400 font-bold">{totalXp} / {Math.ceil((totalXp + 1) / 500) * 500} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (totalXp % 500) / 5)}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
            {[
              { id: 'missions', label: 'Missions', icon: <Target className="w-4 h-4" /> },
              { id: 'rewards', label: 'Rewards Store', icon: <Gift className="w-4 h-4" /> },
              { id: 'how_it_works', label: 'How It Works', icon: <BookOpen className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* MISSIONS TAB */}
        {activeTab === 'missions' && (
          <>
            {/* Category filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: 'all', label: 'All Missions' },
                { id: 'learning', label: '📚 Learning' },
                { id: 'project', label: '💻 Projects' },
                { id: 'skill', label: '🎯 Skills' },
                { id: 'community', label: '👥 Community' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat.id
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Missions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className={`relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer group ${mission.status === 'completed'
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : mission.status === 'in_progress'
                      ? 'bg-indigo-950/40 border-indigo-500/30 ring-1 ring-indigo-500/20'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5'
                    }`}
                >
                  {/* AI Badge */}
                  {mission.ai_powered && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full text-[10px] font-bold text-violet-300">
                        <Sparkles className="w-3 h-3" /> AI Powered
                      </span>
                    </div>
                  )}

                  {/* In Progress Badge */}
                  {mission.status === 'in_progress' && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 animate-pulse">
                        <Play className="w-3 h-3" /> In Progress
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(mission.category)}`}>
                        {getCategoryIcon(mission.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-indigo-300 transition-colors truncate">
                          {mission.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(mission.difficulty)}`}>
                            {mission.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {mission.estimated_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{mission.description}</p>

                    {/* Steps preview */}
                    <div className="space-y-1.5 mb-4">
                      {(mission.steps || []).slice(0, 3).map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          {mission.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                          )}
                          <span className={mission.status === 'completed' ? 'text-emerald-300 line-through' : 'text-slate-400'}>{step}</span>
                        </div>
                      ))}
                      {(mission.steps || []).length > 3 && (
                        <span className="text-[10px] text-slate-500 pl-5">+{mission.steps.length - 3} more steps</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-black text-amber-400">+{mission.xp_reward} XP</span>
                      </div>
                      {mission.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                      ) : mission.status === 'in_progress' ? (
                        <span className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">
                          Continue <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-indigo-400 text-xs font-semibold group-hover:text-indigo-300">
                          Start <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate More Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleGenerateMore}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> AI is generating new missions...</>
                ) : (
                  <><Plus className="w-4 h-4" /> <Sparkles className="w-4 h-4" /> Generate More Missions with AI</>
                )}
              </button>
            </div>
          </>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Rewards Store</h2>
              <p className="text-sm text-slate-400">Spend your XP on certifications, promo codes, and exclusive features</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">Your Balance: {totalXp} XP</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rewards.map((reward) => {
                const canAfford = totalXp >= reward.xp_cost;
                return (
                  <div key={reward.id} className={`rounded-xl border p-5 transition-all ${canAfford
                    ? 'bg-white/[0.06] border-amber-500/30 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer'
                    : 'bg-white/[0.02] border-white/5'
                    }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reward.reward_type === 'certification' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400' :
                        reward.reward_type === 'promocode' ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400' :
                          reward.reward_type === 'badge' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400' :
                            'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400'
                        }`}>
                        {getRewardIcon(reward.reward_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{reward.title}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{reward.reward_type}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">{reward.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{reward.xp_cost.toLocaleString()} XP</span>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={() => handleRedeemReward(reward.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                      >
                        {canAfford ? 'Redeem' : `Need ${(reward.xp_cost - totalXp).toLocaleString()} more`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HOW IT WORKS TAB */}
        {activeTab === 'how_it_works' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-2">How Missions Work</h2>
              <p className="text-slate-400">Your path from beginner to certified professional — powered by AI</p>
            </div>

            <div className="space-y-6 mb-12">
              {[
                {
                  step: 1,
                  icon: <Target className="w-6 h-6" />,
                  title: 'Pick a Mission',
                  description: 'AI generates personalized missions based on your role. Each mission has clear steps, XP rewards, and connects to real learning activities on the platform.',
                  color: 'from-blue-500 to-indigo-500'
                },
                {
                  step: 2,
                  icon: <Sparkles className="w-6 h-6" />,
                  title: 'AI Helps You Complete It',
                  description: 'Many missions are AI-powered. ChatGPT with web search helps you learn faster, generate code, build projects, and review your work in real-time.',
                  color: 'from-violet-500 to-purple-500'
                },
                {
                  step: 3,
                  icon: <Zap className="w-6 h-6" />,
                  title: 'Earn XP Points',
                  description: 'Complete missions to earn XP. Easy = 150-250 XP, Medium = 300-500 XP, Hard = 750+ XP, Epic = 1500+ XP. Your XP is saved in the database permanently.',
                  color: 'from-amber-500 to-orange-500'
                },
                {
                  step: 4,
                  icon: <Gift className="w-6 h-6" />,
                  title: 'Redeem Rewards',
                  description: 'Spend XP in the Rewards Store! Get certifications for LinkedIn, promo codes for Udemy & Coursera, exclusive badges, and AI-powered career tools.',
                  color: 'from-emerald-500 to-teal-500'
                },
                {
                  step: 5,
                  icon: <Crown className="w-6 h-6" />,
                  title: 'Level Up Your Career',
                  description: 'With real projects, certifications, and skills — you\'re ready for interviews, promotions, and your dream role. Your portfolio speaks for itself.',
                  color: 'from-rose-500 to-pink-500'
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-5 items-start">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {item.step}</span>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* XP Table */}
            <div className="bg-white/[0.04] rounded-xl border border-white/10 p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> XP Rewards Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Easy Mission', xp: '150-250', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Medium Mission', xp: '300-500', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Hard Mission', xp: '750+', color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Epic Mission', xp: '1500+', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                ].map((tier, i) => (
                  <div key={i} className={`${tier.bg} rounded-xl p-4 text-center`}>
                    <div className={`text-2xl font-black ${tier.color} mb-1`}>{tier.xp}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{tier.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedMission(null)}>
          <div
            className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 border-b border-white/10">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(selectedMission.category)}`}>
                  {getCategoryIcon(selectedMission.category)}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">{selectedMission.title}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(selectedMission.difficulty)}`}>
                      {selectedMission.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedMission.estimated_time}
                    </span>
                    {selectedMission.ai_powered && (
                      <span className="flex items-center gap-1 text-[10px] text-violet-300 font-bold">
                        <Sparkles className="w-3 h-3" /> AI Powered
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{selectedMission.description}</p>
            </div>

            {/* Steps */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mission Steps</h3>
              <div className="space-y-3 mb-6">
                {(selectedMission.steps || []).map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300">{step}</span>
                  </div>
                ))}
              </div>

              {/* Reward */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Reward</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-2xl font-black text-amber-400">+{selectedMission.xp_reward} XP</span>
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-amber-400/40" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedMission.status === 'completed' ? (
                  <div className="flex-1 px-6 py-3 bg-emerald-600/20 text-emerald-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" /> Mission Completed!
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleStartMission(selectedMission);
                      setSelectedMission(null);
                    }}
                    disabled={startingMission === selectedMission.id}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                  >
                    {startingMission === selectedMission.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                    ) : selectedMission.status === 'in_progress' ? (
                      <><Play className="w-4 h-4" /> Continue Mission</>
                    ) : (
                      <><Play className="w-4 h-4" /> Start Mission</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedMission(null)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-medium text-sm transition-colors border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
