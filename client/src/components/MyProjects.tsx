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
  Flame,
  Radio,
  Wifi,
  ZoomIn,
  ZoomOut,
  Edit2,
  Trash2,
  X
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
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [zoom, setZoom] = useState(0.85);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '' });


  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${localStorage.getItem('token')}`);

    es.addEventListener('snapshot', (e: MessageEvent) => {
      try {
        const snap = JSON.parse(e.data);
        if (snap && snap.projects) {
          const parsedProjects = snap.projects.map((p: any) => ({
            ...p,
            project_data: typeof p.project_data === 'string' ? JSON.parse(p.project_data) : p.project_data,
            progress_data: typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data,
          }));
          setProjects(parsedProjects);
          setLoading(false);
          setIsLive(true);
          setLastSync(new Date());
        }
      } catch (error) {
        console.error('Failed to parse snapshot:', error);
      }
    });

    es.addEventListener('project_update', (_e: MessageEvent) => {
      try {
        fetch(`/api/realtime/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch { /* ignore */ }
    });

    es.onopen = () => setIsLive(true);
    es.onerror = () => setIsLive(false);

    return () => {
      es.close();
    };
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

  const handleDelete = async () => {
    if (!deletingProject || !user) return;
    try {
      const res = await fetch(`/api/role/project/${deletingProject.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== deletingProject.id));
        setDeletingProject(null);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !user) return;
    try {
      const res = await fetch(`/api/role/project/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: editForm.title,
          description: editForm.description,
          status: editForm.status
        })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { 
          ...p, 
          title: editForm.title, 
          description: editForm.description, 
          status: editForm.status 
        } : p));
        setEditingProject(null);
      }
    } catch (e) {
      console.error('Edit failed:', e);
    }
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
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${isLive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {isLive
                    ? <><Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE</>
                    : <><Wifi className="w-2.5 h-2.5" /> Connecting…</>}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                Track and manage all your learning projects
                {!loading && <span className="text-slate-400 ml-2">· synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="fixed top-24 right-6 md:right-10 z-40 flex flex-col gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 shadow-sm shadow-slate-200">
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-indigo-600"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-indigo-600 flex items-center justify-center font-bold text-[10px] w-9 h-9 sm:w-auto sm:h-9 sm:px-2"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-indigo-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-8 pb-12 transition-all duration-300" style={{ zoom } as React.CSSProperties}>

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
                          
                          <div className="flex items-center gap-1.5 ml-4">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setEditForm({ 
                                  title: project.title, 
                                  description: project.description || project.project_data?.description || '', 
                                  status: project.status 
                                }); 
                                setEditingProject(project); 
                              }} 
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                              title="Edit Project"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeletingProject(project); 
                              }} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" 
                              title="Delete Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Project?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong className="text-slate-700">{deletingProject.title}</strong>? This action cannot be undone and you will lose all progress for this project.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeletingProject(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm shadow-rose-200"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Edit Project
              </h3>
              <button 
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea 
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm min-h-[100px] resize-y"
                    placeholder="Enter project description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={e => setEditForm(prev => ({...prev, status: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium bg-white"
                  >
                    <option value="active">Active (In Progress)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
