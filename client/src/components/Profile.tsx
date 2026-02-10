import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Code,
  Edit,
  Camera,
  Sparkles,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  GraduationCap,
  LogOut,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  // Mock user data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Software Engineer",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    bio: "Passionate about building amazing web applications and learning new technologies. Currently focusing on full-stack development and cloud technologies.",
    skills: [
      { name: "JavaScript", level: 85 },
      { name: "React", level: 80 },
      { name: "Node.js", level: 75 },
      { name: "TypeScript", level: 70 },
      { name: "Python", level: 65 },
      { name: "SQL", level: 60 },
    ],
    stats: {
      projectsCompleted: 8,
      totalProjects: 12,
      learningStreak: 15,
      totalLearningHours: 240,
      achievementsUnlocked: 24,
      skillsMastered: 6,
    },
    recentActivity: [
      { action: "Completed", item: "Weather Dashboard Project", date: "2 days ago", icon: Trophy },
      { action: "Started", item: "E-commerce Store Project", date: "3 days ago", icon: Code },
      { action: "Achieved", item: "15-Day Learning Streak", date: "5 days ago", icon: Sparkles },
      { action: "Mastered", item: "React Hooks Skill", date: "1 week ago", icon: Target },
    ],
  };

  const completionRate = (userData.stats.projectsCompleted / userData.stats.totalProjects) * 100;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
                <p className="text-xs text-slate-600">Manage your account and track progress</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-6">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
              {/* Profile Picture */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {userData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{userData.name}</h2>
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-2">
                  {userData.role}
                </span>
                <p className="text-xs text-slate-600">{userData.bio}</p>
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {userData.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {userData.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Joined {userData.joinDate}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  {userData.role}
                </div>
              </div>

              <button
                className="w-full px-4 py-2 border-2 border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 mt-5">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                Skills Progress
              </h3>
              <div className="space-y-3">
                {userData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-700">{skill.name}</span>
                      <span className="text-xs font-semibold text-indigo-600">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-7 h-7 text-yellow-600" />
                  <span className="text-2xl font-bold text-slate-900">
                    {userData.stats.projectsCompleted}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-1">Projects Completed</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  {userData.stats.projectsCompleted} of {userData.stats.totalProjects} done
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-7 h-7 text-orange-600" />
                  <span className="text-2xl font-bold text-slate-900">
                    {userData.stats.learningStreak}
                  </span>
                </div>
                <p className="text-xs text-slate-600">Day Streak</p>
                <p className="text-xs text-slate-500 mt-1">Keep it going! 🔥</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-7 h-7 text-blue-600" />
                  <span className="text-2xl font-bold text-slate-900">
                    {userData.stats.totalLearningHours}h
                  </span>
                </div>
                <p className="text-xs text-slate-600">Learning Hours</p>
                <p className="text-xs text-slate-500 mt-1">Total time invested</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {userData.stats.achievementsUnlocked}
                    </p>
                    <p className="text-xs text-slate-700">Achievements Unlocked</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {userData.stats.skillsMastered}
                    </p>
                    <p className="text-xs text-slate-700">Skills Mastered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h3>
              <div className="space-y-2.5">
                {userData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-900">
                        <span className="font-semibold">{activity.action}</span> {activity.item}
                      </p>
                      <p className="text-xs text-slate-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/roadmap")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                View Learning Roadmap
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                My Projects
              </button>
              <button
                className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Achievements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
