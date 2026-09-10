export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration?: string;
  matchScore?: number;
  tags: string[];
  trending?: boolean;
  whyRecommended?: string[];
  skillsToDevelop?: string[];
  tools?: string[];
  languages?: string[];
  setupGuide?: { title: string; steps: string[] };
  status?: 'active' | 'completed' | 'saved' | 'none' | 'undo';
  last_updated?: string;
  careerImpact?: string[];
  metrics?: { matchIncrease: string; xp: number; timeEstimate: string; roleRelevance: string };
  skillGainEstimates?: { skill: string; before: number; after: number }[];
  curriculumStats?: { modules: number; tasks: number; deployment: boolean; codeReview: boolean };
  recruiterAppeal?: string[];
  progress_data?: any;
  project_data?: any;
  role?: string;
  projectId?: string;
}

/**
 * Safely parse a value into an object.
 * If it's a JSON string, parse it.
 * If it's already an object, return it.
 * Otherwise, return an empty object.
 */
export const object = (val: any): any => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  return typeof val === 'object' && val !== null ? val : {};
};

/**
 * Ensures an array of projects is returned and safely parses fields if from the database.
 */
export const parseProjects = (val: any, fromDb: boolean = false): Project[] => {
  const arr = Array.isArray(val) ? val : [];
  
  if (fromDb) {
    return arr.map(p => {
      // Handle parsing tags and nested data from PostgreSQL string fields if needed
      const tags = typeof p.tags === 'string' ? safeParse(p.tags, []) : (p.tags || []);
      const progress_data = typeof p.progress_data === 'string' ? safeParse(p.progress_data, {}) : (p.progress_data || {});
      const project_data = typeof p.project_data === 'string' ? safeParse(p.project_data, {}) : (p.project_data || {});
      return { ...p, tags, progress_data, project_data };
    });
  }
  
  return arr.map(p => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : []
  }));
};

function safeParse(val: string, fallback: any) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Calculates progress total and done tasks.
 */
export const projectProgress = (project: Project) => {
  const done = Array.isArray(project.progress_data?.completedTasks) 
    ? project.progress_data.completedTasks.length 
    : 0;
    
  let total = 0;
  if (project.project_data?.curriculum?.steps) {
    total = project.project_data.curriculum.steps.reduce((acc: number, step: any) => 
      acc + (Array.isArray(step.tasks) ? step.tasks.length : 0), 0);
  } else if (project.curriculumStats?.tasks) {
    total = project.curriculumStats.tasks;
  }
  
  // Guarantee total is at least done so progress bars don't exceed 100%
  total = Math.max(total, done);
  
  return { total, done };
};
