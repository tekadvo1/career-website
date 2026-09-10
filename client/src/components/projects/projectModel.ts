export interface TaskGuide {
  title: string;
  understand: string;
  before_you_begin: string;
  implement_step: string;
  implement_quick: string;
  try_it: string;
  expected_result: string;
  check_your_work: string;
  resources: string[];
}

export type CheckStatus = 'not_checked' | 'passed' | 'failed' | 'blocked';

export interface StartupInstruction {
  id: string;
  component: string;
  prerequisites: string;
  workingDirectory: string;
  command: string;
  description: string;
  envVars: string[];
  expectedOutput: string;
  howToStop: string;
}

export interface CheckHistoryEntry {
  from: CheckStatus;
  to: CheckStatus;
  notes: string;
  timestamp: string;
  provenance: 'user' | 'platform';
}

export interface FeatureCheck {
  id: string;
  category: string;
  title: string;
  prerequisites: string;
  steps: string[];
  exampleInput: string;
  expectedBehavior: string;
  relatedTaskId: string | null;
  status: CheckStatus;
  provenance: 'user' | 'platform';
  notes: string;
  lastCheckedAt: string | null;
  history: CheckHistoryEntry[];
}

export interface TestRunnerConfig {
  available: boolean;
  command: string;
  directory: string;
  description: string;
  interpretOutput: string;
}

export interface TroubleshootDiagnosis {
  likelyCause: string;
  diagnosticStep: string;
  proposedFix: string;
  rerunInstruction: string;
}

export interface RunTestData {
  startup: StartupInstruction[];
  checks: FeatureCheck[];
  testRunner: TestRunnerConfig;
  generatedAt: string;
  version: number;
}

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
  schedule_data?: ScheduleSettings;
  setup_data?: any;
  blueprint_data?: any;
  runtest_data?: RunTestData;
  role?: string;
  projectId?: string;
  type?: string;
}

export interface ScheduleSettings {
  mode: 'self-paced' | 'scheduled';
  dailyHours: number;
  selectedDays: string[];
  startDate: string;
  timezone: string;
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
      const setup_data = typeof p.setup_data === 'string' ? safeParse(p.setup_data, {}) : (p.setup_data || {});
      const blueprint_data = typeof p.blueprint_data === 'string' ? safeParse(p.blueprint_data, {}) : (p.blueprint_data || {});
      const runtest_data = typeof p.runtest_data === 'string' ? safeParse(p.runtest_data, {}) : (p.runtest_data || {});
      return { ...p, tags, progress_data, project_data, setup_data, blueprint_data, runtest_data };
    });
  }
  
  return arr.map(p => {
    const { status, progress_data, project_data, ...rest } = p;
    return {
      ...rest,
      tags: Array.isArray(rest.tags) ? rest.tags : []
    };
  });
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
