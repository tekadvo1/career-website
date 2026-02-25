import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Trophy,
  Star,
  Target,
  Award,
  Lock,
  CheckCircle,
  Calendar,
  Zap,
  AlertCircle,
} from 'lucide-react';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  earned: boolean;
  earnedDate: string | null;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  points: number;
  progress: number;
  total: number;
  reward: string;
}

const rarityColor: Record<string, string> = {
  Common: 'bg-slate-100 text-slate-700 border-slate-300',
  Rare: 'bg-blue-100 text-blue-700 border-blue-300',
  Epic: 'bg-purple-100 text-purple-700 border-purple-300',
  Legendary: 'bg-amber-100 text-amber-700 border-amber-300',
};

const rarityGradient: Record<string, string> = {
  Common: 'from-slate-400 to-slate-600',
  Rare: 'from-blue-400 to-blue-600',
  Epic: 'from-purple-400 to-purple-600',
  Legendary: 'from-amber-400 via-yellow-500 to-amber-600',
};

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load achievements');
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const displayed = achievements.filter((a) => {
    if (filter === 'earned') return a.earned;
    if (filter === 'locked') return !a.earned;
    return true;
  });

  const earned = achievements.filter((a) => a.earned);
  const totalPoints = earned.reduce((s, a) => s + a.points, 0);
  const completion =
    achievements.length > 0
      ? Math.round((earned.length / achievements.length) * 100)
      : 0;
  const nextMilestone = achievements.find((a) => !a.earned && a.progress > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Shared Sidebar */}
      <Sidebar activePage="achievements" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6 pl-12">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Trophy className="w-7 h-7 text-amber-500" />
                <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
              </div>
              <p className="text-slate-600 text-sm">Track your progress and unlock rewards</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <p className="text-xs text-slate-600">Total</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{achievements.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">achievements</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600">Earned</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{earned.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">unlocked</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-slate-600">Points</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalPoints}</p>
              <p className="text-[11px] text-slate-500 mt-1">total earned</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-slate-600">Progress</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{completion}%</p>
              <p className="text-[11px] text-slate-500 mt-1">completion</p>
            </div>
          </div>

          {/* Next Milestone Banner */}
          {nextMilestone && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-2xl">
                    {nextMilestone.icon}
                  </div>
                  <div>
                    <p className="font-bold mb-1">Next: {nextMilestone.title}</p>
                    <p className="text-indigo-100 text-sm">{nextMilestone.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-white/20 rounded-full h-2 w-40 overflow-hidden">
                        <div
                          className="bg-white h-full transition-all duration-500"
                          style={{ width: `${(nextMilestone.progress / nextMilestone.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {nextMilestone.progress}/{nextMilestone.total}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-200 mb-1">{nextMilestone.rarity}</p>
                  <p className="text-2xl font-bold">+{nextMilestone.points}</p>
                  <p className="text-xs text-indigo-200">points</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: `All (${achievements.length})` },
              { key: 'earned', label: `Earned (${earned.length})` },
              { key: 'locked', label: `Locked (${achievements.length - earned.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'earned' | 'locked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? key === 'earned'
                      ? 'bg-green-600 text-white shadow-md'
                      : key === 'locked'
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Loading achievements...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-slate-700 font-medium">{error}</p>
            <button
              onClick={fetchAchievements}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Trophy className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500">No achievements found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((a) => (
              <div
                key={a.id}
                className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                  a.earned
                    ? 'border-indigo-200 hover:shadow-xl hover:-translate-y-0.5'
                    : 'border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      rarityColor[a.rarity] || rarityColor['Common']
                    }`}
                  >
                    {a.rarity}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`relative w-16 h-16 mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                    a.earned
                      ? `bg-gradient-to-br ${rarityGradient[a.rarity]}`
                      : 'bg-slate-200'
                  }`}
                >
                  {a.earned ? (
                    <span>{a.icon}</span>
                  ) : (
                    <Lock className="w-7 h-7 text-slate-400" />
                  )}
                  {a.earned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-slate-900 mb-1">{a.title}</h3>
                <p className="text-slate-600 text-sm mb-3">{a.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                    {a.category}
                  </span>
                  <span className="text-slate-700 text-sm font-bold">
                    <Zap className="inline w-3.5 h-3.5 text-amber-500 mr-0.5" />
                    +{a.points} pts
                  </span>
                </div>

                {/* Progress Bar (only for locked with partial progress) */}
                {!a.earned && a.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="font-bold">{a.progress}/{a.total}</span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min((a.progress / a.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Earned Date */}
                {a.earned && a.earnedDate && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Earned on {a.earnedDate}</span>
                  </div>
                )}

                {/* Reward */}
                <div
                  className={`mt-3 p-3 rounded-lg text-xs ${
                    a.earned
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Award
                      className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                        a.earned ? 'text-green-600' : 'text-slate-400'
                      }`}
                    />
                    <p className={a.earned ? 'text-green-700' : 'text-slate-500'}>
                      {a.reward}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
