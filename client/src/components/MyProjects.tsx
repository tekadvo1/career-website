import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Trophy,
  PlaySquare,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Flame
} from 'lucide-react';
import Sidebar from './Sidebar';

interface Project {
  id: string | number;
  title: string;
  description: string;
  role: string;
  status: string; // 'active', 'completed', 'paused'
  project_data: any;
  progress_data: any;
  created_at: string;
  last_updated: string;
}

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/role/my-projects?userId=${user.id}`);
        const data = await response.json();
        if (data.success && data.projects) {
          // Parse JSON fields if they come as strings
          const parsedProjects = data.projects.map((p: any) => ({
            ...p,
            project_data: typeof p.project_data === 'string' ? JSON.parse(p.project_data) : p.project_data,
            progress_data: typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data,
          }));
          setProjects(parsedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, navigate]);

  // Aggregate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  // Calculate average progress and total hours
  let totalProgress = 0;
  let totalHours = 0;

  projects.forEach(p => {
    const completedTasks = p.progress_data?.completedTasks?.length || 0;
    
    // Count total tasks from curriculum
    let taskCount = 0;
    const curriculum = p.project_data?.curriculum || [];
    curriculum.forEach((mod: any) => {
      if (mod.tasks) {
        taskCount += mod.tasks.length;
      } else {
        taskCount += 1;
      }
    });

    const progressPercentage = taskCount === 0 ? 0 : Math.round((completedTasks / taskCount) * 100);
    totalProgress += progressPercentage > 100 ? 100 : progressPercentage;
    
    // Estimate hours spent based on completed tasks (roughly 1.5 hours per task as fallback if not tracking real time)
    // Could also pull from xp
    const xp = p.progress_data?.xp || parseInt(p.progress_data?.xp) || 0;
    totalHours += Math.floor(xp / 50); // Simplified heuristic for dummy hours
  });

  const avgProgress = totalProjects === 0 ? 0 : Math.round(totalProgress / totalProjects);

  // Filter and search
  const filteredProjects = projects.filter(p => {
    if (filter === 'active' && p.status !== 'active') return false;
    if (filter === 'completed' && p.status !== 'completed') return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenProject = (project: Project) => {
    navigate('/project-workspace', { state: { project } });
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return 'bg-slate-100 text-slate-700';
    const d = difficulty.toLowerCase();
    if (d.includes('beginner') || d.includes('easy')) return 'bg-emerald-100 text-emerald-700';
    if (d.includes('intermediate') || d.includes('medium')) return 'bg-blue-100 text-blue-700';
    if (d.includes('advanced') || d.includes('hard')) return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Helper to get stats for a single project
  const getProjectStats = (p: Project) => {
    let taskCount = 0;
    const curriculum = p.project_data?.curriculum || [];
    curriculum.forEach((mod: any) => {
      if (mod.tasks) taskCount += mod.tasks.length;
      else taskCount += 1;
    });
    const completedTasks = p.progress_data?.completedTasks?.length || 0;
    const progressPercent = taskCount === 0 ? 0 : Math.min(100, Math.round((completedTasks / taskCount) * 100));
    
    const xp = p.progress_data?.xp || parseInt(p.progress_data?.xp) || 0;
    const hoursSpent = Math.floor(xp / 50);
    const totalEstHours = p.project_data?.metrics?.timeEstimate ? parseInt(p.project_data.metrics.timeEstimate) : Math.floor(taskCount * 1.5);

    // AI Next Up
    let nextUpTask = "Review curriculum to start";
    if (curriculum.length > 0) {
      for (const mod of curriculum) {
         let found = false;
         const tasks = mod.tasks || [{ id: mod.id, title: `Review ${mod.title}` }];
         for (const t of tasks) {
            const taskId = t.id || t;
            if (!p.progress_data?.completedTasks?.includes(taskId)) {
               nextUpTask = t.title || t.text || t.description || t;
               found = true;
               break;
            }
         }
         if (found) break;
      }
      if (progressPercent >= 100) nextUpTask = "All tasks completed!";
    }

    return { taskCount, completedTasks, progressPercent, hoursSpent, totalEstHours, nextUpTask };
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activePage="my-projects" />
      
      <div className="flex-1 overflow-y-auto">
        {/* Sticky Header Top Bar to protect Hamburger Menu */}
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/50 px-6 md:px-8 py-4 mb-6">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0" /> {/* Spacer for system hamburger menu */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track and manage all your learning projects</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-8 pb-12">

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <Trophy className="w-4 h-4 text-indigo-500" />
                <span>Total Projects</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalProjects}</p>
            </div>
            
            <div className="bg-[#f0f9ff] p-5 rounded-xl shadow-sm border border-blue-100 border-t-4 border-t-blue-400">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <PlaySquare className="w-4 h-4 text-blue-500" />
                <span>Active</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{activeProjects}</p>
            </div>
            
            <div className="bg-[#f0fdf4] p-5 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-400">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Completed</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{completedProjects}</p>
            </div>
            
            <div className="bg-[#fffbeb] p-5 rounded-xl shadow-sm border border-amber-100 border-t-4 border-t-amber-400">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Total Hours</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalHours}</p>
            </div>
            
            <div className="bg-[#faf5ff] p-5 rounded-xl shadow-sm border border-purple-100 border-t-4 border-t-purple-400">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span>Avg Progress</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{avgProgress}%</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                All ({totalProjects})
              </button>
              <button 
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'active' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Active ({activeProjects})
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Completed ({completedProjects})
              </button>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
               />
            </div>
          </div>

          {/* Project List */}
          {loading ? (
             <div className="flex items-center justify-center py-20">
                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             </div>
          ) : filteredProjects.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">No projects found</h3>
               <p className="text-slate-500">You haven't {filter === 'all' ? 'started any' : `${filter} any`} projects yet.</p>
             </div>
          ) : (
             <div className="space-y-6">
               {filteredProjects.map((project) => {
                 const stats = getProjectStats(project);
                 const tags = project.project_data?.tags || project.project_data?.tools || ['React', 'Node.js', 'Fullstack'];
                 
                 return (
                   <div key={project.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                     <div className="p-6">
                       <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center gap-3 flex-wrap">
                           <h3 className="text-xl font-bold text-slate-800">{project.title}</h3>
                           <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getDifficultyColor(project.project_data?.difficulty)}`}>
                             {project.project_data?.difficulty || 'Intermediate'}
                           </span>
                           <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                             {project.status === 'active' ? 'In Progress' : 'Completed'}
                           </span>
                         </div>
                       </div>
                       
                       <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                         {project.description || project.project_data?.description || 'Build a scalable application with modern architecture.'}
                       </p>
                       
                       <div className="flex gap-2 flex-wrap mb-6">
                         {tags.slice(0, 4).map((tag: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-md shadow-sm border border-slate-200/60">
                             {tag}
                           </span>
                         ))}
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="mb-6">
                         <div className="flex items-center justify-between text-sm mb-2">
                           <span className="text-slate-600 font-medium">Progress</span>
                           <span className="font-bold text-slate-800">{stats.progressPercent}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                             style={{ width: `${stats.progressPercent}%` }}
                           />
                         </div>
                       </div>
                       
                       {/* Metrics inline */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                         <div>
                           <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             <span>Tasks</span>
                           </div>
                           <p className="font-bold text-slate-800 tracking-wide">{stats.completedTasks}/{stats.taskCount}</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                             <Clock className="w-4 h-4 text-indigo-500" />
                             <span>Hours Spent</span>
                           </div>
                           <p className="font-bold text-slate-800 tracking-wide">{stats.hoursSpent}/{stats.totalEstHours}h</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                             <TrendingUp className="w-4 h-4 text-purple-500" />
                             <span>Started</span>
                           </div>
                           <p className="font-bold text-slate-800 tracking-wide">
                             {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
                           </p>
                         </div>
                         <div>
                           <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                             <Clock className="w-4 h-4 text-amber-500" />
                             <span>Last Updated</span>
                           </div>
                           <p className="font-bold text-slate-800 tracking-wide">
                             {new Date(project.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
                           </p>
                         </div>
                       </div>
                       
                       {/* Next Up Section */}
                       <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                         <div className="flex items-start gap-4">
                           <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                             <TrendingUp className="w-5 h-5 text-indigo-600" />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-indigo-900 mb-1">Next Up</h4>
                             <p className="text-sm text-indigo-700 mb-2">{stats.nextUpTask}</p>
                             
                             <div className="flex items-center gap-4 text-xs font-semibold text-indigo-500">
                               <span className="flex items-center gap-1 text-orange-500">
                                 <Flame className="w-3.5 h-3.5 fill-orange-500" /> 
                                 3 day streak
                               </span>
                               <span>•</span>
                               <span>Last worked: {new Date(project.last_updated).toLocaleDateString()}</span>
                             </div>
                           </div>
                         </div>
                         
                         <button 
                           onClick={() => handleOpenProject(project)}
                           className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-indigo-200 whitespace-nowrap"
                         >
                           Continue
                         </button>
                       </div>
                       
                     </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
