export interface SalaryInsights {
  entry_level?: string;
  senior_level?: string;
  salary_growth_potential?: string;
  negotiation_tips?: string;
}

export interface DayInLifeStep {
  time?: string;
  activity?: string;
  description?: string;
}

export interface CareerPath {
  role?: string;
  timeframe?: string;
  description?: string;
}

export interface InterviewPrepStep {
  question?: string;
  strategy?: string;
  example?: string;
}

export interface SoftSkill {
  name: string;
  description?: string;
}

export interface HardSkill {
  name: string;
  description?: string;
  why_it_matters?: string;
}

export interface ToolOrTech {
  name: string;
  used_for?: string;
  relation_to_role?: string;
  documentation_url?: string;
}

export interface LearningResource {
  name: string;
  type?: string;
  provider?: string;
  duration?: string;
  category?: string;
  description?: string;
  url?: string;
}

export interface WorkflowStep {
  stage: string;
  description?: string;
}

export interface NormalizedRoleAnalysis {
  title: string;
  description: string;
  jobGrowth?: string;
  salaryRange?: string;
  
  salary_insights?: SalaryInsights;
  day_in_the_life?: DayInLifeStep[];
  career_paths?: CareerPath[];
  interview_prep?: InterviewPrepStep[];
  
  soft_skills?: SoftSkill[];
  skills?: HardSkill[];
  
  tools?: ToolOrTech[];
  languages?: ToolOrTech[];
  frameworks?: ToolOrTech[];
  
  resources?: LearningResource[];
  workflow?: WorkflowStep[];
}
