import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  Code, 
  Wrench, 
  BookOpen, 
  Download,
  ChevronRight,
  Check,
  Clock,
  Award,
  ExternalLink
} from 'lucide-react';

// Mock role data - based on user's role input
const roleDatabase: Record<string, any> = {
  "Software Engineer": {
    title: "Software Engineer",
    description: "Design, develop, and maintain software applications using various programming languages and frameworks. Work on complex problems and collaborate with cross-functional teams.",
    jobGrowth: "22% (Much faster than average)",
    salaryRange: "$80,000 - $180,000",
    skills: [
      { name: "Data Structures & Algorithms", level: "Advanced", priority: "High Priority", timeToLearn: "6 months" },
      { name: "Object-Oriented Programming", level: "Advanced", priority: "High Priority", timeToLearn: "4 months" },
      { name: "System Design", level: "Intermediate", priority: "High Priority", timeToLearn: "5 months" },
      { name: "Testing & Debugging", level: "Intermediate", priority: "Medium Priority", timeToLearn: "2 months" },
      { name: "Version Control (Git)", level: "Intermediate", priority: "High Priority", timeToLearn: "1 month" },
      { name: "Agile Methodologies", level: "Beginner", priority: "Medium Priority", timeToLearn: "2-3 weeks" }
    ],
    tools: [
      { name: "VS Code", category: "IDE", description: "Popular code editor", difficulty: "Easy" },
      { name: "GitHub", category: "Version Control", description: "Code repository platform", difficulty: "Easy" },
      { name: "Docker", category: "Containerization", description: "Container platform", difficulty: "Medium" },
      { name: "Jira", category: "Project Management", description: "Agile project tracking", difficulty: "Easy" },
      { name: "Postman", category: "API Testing", description: "API development tool", difficulty: "Easy" }
    ],
    languages: [
      "JavaScript/TypeScript",
      "Python",
      "Java",
      "C++",
      "Go"
    ],
    frameworks: [
      "React",
      "Node.js",
      "Express",
      "Spring Boot",
      "Django"
    ],
    resources: [
      { 
        name: "CS50's Introduction to Computer Science", 
        provider: "Harvard (edX)", 
        type: "free", 
        duration: "12 weeks",
        category: "Course",
        url: "https://cs50.harvard.edu/"
      },
      { 
        name: "The Odin Project", 
        provider: "The Odin Project", 
        type: "free", 
        duration: "Self-paced",
        category: "Tutorial",
        url: "https://www.theodinproject.com/"
      },
      { 
        name: "LeetCode", 
        provider: "LeetCode", 
        type: "free", 
        duration: "Ongoing",
        category: "Tutorial",
        url: "https://leetcode.com/"
      },
      { 
        name: "System Design Primer", 
        provider: "GitHub", 
        type: "free", 
        duration: "Self-paced",
        category: "Documentation",
        url: "https://github.com/donnemartin/system-design-primer"
      },
      { 
        name: "Complete Web Development Bootcamp", 
        provider: "Udemy", 
        type: "paid", 
        duration: "65 hours",
        category: "Course",
        url: "https://www.udemy.com/"
      }
    ]
  },
  "Product Manager": {
    title: "Product Manager",
    description: "Lead product development from conception to launch. Define product strategy, prioritize features, and work with engineering and design teams.",
    jobGrowth: "18% (Faster than average)",
    salaryRange: "$90,000 - $160,000",
    skills: [
      { name: "Product Strategy", level: "Advanced", priority: "High Priority", timeToLearn: "6 months" },
      { name: "User Research", level: "Intermediate", priority: "High Priority", timeToLearn: "3 months" },
      { name: "Data Analysis", level: "Intermediate", priority: "High Priority", timeToLearn: "4 months" },
      { name: "Roadmap Planning", level: "Advanced", priority: "High Priority", timeToLearn: "5 months" },
      { name: "Stakeholder Management", level: "Intermediate", priority: "Medium Priority", timeToLearn: "3 months" },
      { name: "Agile/Scrum", level: "Intermediate", priority: "High Priority", timeToLearn: "2 months" }
    ],
    tools: [
      { name: "Jira", category: "Project Management", description: "Agile project tracking", difficulty: "Easy" },
      { name: "Figma", category: "Design", description: "Collaborative design tool", difficulty: "Easy" },
      { name: "Google Analytics", category: "Analytics", description: "Web analytics platform", difficulty: "Medium" },
      { name: "Notion", category: "Documentation", description: "Knowledge management", difficulty: "Easy" },
      { name: "Miro", category: "Collaboration", description: "Visual collaboration", difficulty: "Easy" }
    ],
    languages: [
      "SQL",
      "Python (for data analysis)",
      "Basic HTML/CSS"
    ],
    frameworks: [
      "Analytics frameworks",
      "Product frameworks (RICE, KANO)"
    ],
    resources: [
      { 
        name: "Product Management Fundamentals", 
        provider: "Coursera", 
        type: "free", 
        duration: "4 weeks",
        category: "Course",
        url: "https://www.coursera.org/"
      },
      { 
        name: "Product School Blog", 
        provider: "Product School", 
        type: "free", 
        duration: "Ongoing",
        category: "Tutorial",
        url: "https://productschool.com/blog"
      },
      { 
        name: "Cracking the PM Interview", 
        provider: "Book", 
        type: "paid", 
        duration: "Self-paced",
        category: "Documentation",
        url: "https://www.amazon.com/"
      }
    ]
  },
  "UI/UX Designer": {
    title: "UI/UX Designer",
    description: "Create intuitive and beautiful user interfaces. Conduct user research, design wireframes and prototypes, and ensure excellent user experience.",
    jobGrowth: "16% (Much faster than average)",
    salaryRange: "$60,000 - $130,000",
    skills: [
      { name: "User Research", level: "Advanced", priority: "High Priority", timeToLearn: "4 months" },
      { name: "Wireframing & Prototyping", level: "Advanced", priority: "High Priority", timeToLearn: "3 months" },
      { name: "Visual Design", level: "Advanced", priority: "High Priority", timeToLearn: "6 months" },
      { name: "Interaction Design", level: "Intermediate", priority: "High Priority", timeToLearn: "4 months" },
      { name: "Usability Testing", level: "Intermediate", priority: "Medium Priority", timeToLearn: "2 months" },
      { name: "Design Systems", level: "Intermediate", priority: "Medium Priority", timeToLearn: "3 months" }
    ],
    tools: [
      { name: "Figma", category: "Design", description: "Collaborative design tool", difficulty: "Easy" },
      { name: "Adobe XD", category: "Design", description: "UI/UX design platform", difficulty: "Medium" },
      { name: "Sketch", category: "Design", description: "Digital design toolkit", difficulty: "Easy" },
      { name: "InVision", category: "Prototyping", description: "Digital product design", difficulty: "Easy" },
      { name: "Maze", category: "Testing", description: "User testing platform", difficulty: "Easy" }
    ],
    languages: [
      "HTML/CSS (basic)",
      "Design principles"
    ],
    frameworks: [
      "Material Design",
      "Human Interface Guidelines"
    ],
    resources: [
      { 
        name: "Google UX Design Certificate", 
        provider: "Coursera", 
        type: "free", 
        duration: "6 months",
        category: "Course",
        url: "https://www.coursera.org/"
      },
      { 
        name: "Laws of UX", 
        provider: "Jon Yablonski", 
        type: "free", 
        duration: "Self-paced",
        category: "Documentation",
        url: "https://lawsofux.com/"
      },
      { 
        name: "Daily UI Challenge", 
        provider: "Daily UI", 
        type: "free", 
        duration: "100 days",
        category: "Tutorial",
        url: "https://www.dailyui.co/"
      }
    ]
  },
  "Data Analyst": {
    title: "Data Analyst",
    description: "Collect, process, and analyze data to help organizations make informed decisions. Create visualizations and reports to communicate insights.",
    jobGrowth: "25% (Much faster than average)",
    salaryRange: "$55,000 - $110,000",
    skills: [
      { name: "SQL & Database Querying", level: "Advanced", priority: "High Priority", timeToLearn: "4 months" },
      { name: "Data Visualization", level: "Advanced", priority: "High Priority", timeToLearn: "3 months" },
      { name: "Statistical Analysis", level: "Intermediate", priority: "High Priority", timeToLearn: "5 months" },
      { name: "Excel/Spreadsheets", level: "Advanced", priority: "High Priority", timeToLearn: "2 months" },
      { name: "Python/R Programming", level: "Intermediate", priority: "Medium Priority", timeToLearn: "6 months" },
      { name: "Business Intelligence", level: "Intermediate", priority: "Medium Priority", timeToLearn: "4 months" }
    ],
    tools: [
      { name: "Excel", category: "Spreadsheet", description: "Data analysis tool", difficulty: "Easy" },
      { name: "Tableau", category: "Visualization", description: "Data visualization platform", difficulty: "Medium" },
      { name: "Power BI", category: "BI Tool", description: "Business intelligence", difficulty: "Medium" },
      { name: "SQL Server", category: "Database", description: "Database management", difficulty: "Medium" },
      { name: "Python (Pandas)", category: "Programming", description: "Data manipulation", difficulty: "Medium" }
    ],
    languages: [
      "SQL",
      "Python",
      "R"
    ],
    frameworks: [
      "Pandas",
      "NumPy",
      "Matplotlib"
    ],
    resources: [
      { 
        name: "Google Data Analytics Certificate", 
        provider: "Coursera", 
        type: "free", 
        duration: "6 months",
        category: "Course",
        url: "https://www.coursera.org/"
      },
      { 
        name: "SQL for Data Science", 
        provider: "Mode Analytics", 
        type: "free", 
        duration: "Self-paced",
        category: "Tutorial",
        url: "https://mode.com/sql-tutorial/"
      },
      { 
        name: "DataCamp", 
        provider: "DataCamp", 
        type: "paid", 
        duration: "Ongoing",
        category: "Course",
        url: "https://www.datacamp.com/"
      }
    ]
  }
};

// Default/fallback data for unknown roles
const getDefaultRoleData = (roleName: string) => ({
  title: roleName,
  description: `Explore opportunities in ${roleName}. This is an emerging or specialized field with growing demand.`,
  jobGrowth: "15% (Faster than average)",
  salaryRange: "$50,000 - $120,000",
  skills: [
    { name: "Core Technical Skills", level: "Intermediate", priority: "High Priority", timeToLearn: "4-6 months" },
    { name: "Problem Solving", level: "Advanced", priority: "High Priority", timeToLearn: "Ongoing" },
    { name: "Communication", level: "Intermediate", priority: "Medium Priority", timeToLearn: "3 months" },
    { name: "Industry Knowledge", level: "Beginner", priority: "Medium Priority", timeToLearn: "2-3 months" }
  ],
  tools: [
    { name: "Industry-standard tools", category: "General", description: "Common tools for this role", difficulty: "Medium" }
  ],
  languages: ["English", "Domain-specific languages"],
  frameworks: ["Industry frameworks"],
  resources: [
    { 
      name: "LinkedIn Learning", 
      provider: "LinkedIn", 
      type: "paid", 
      duration: "Varies",
      category: "Course",
      url: "https://www.linkedin.com/learning/"
    },
    { 
      name: "YouTube Tutorials", 
      provider: "Various", 
      type: "free", 
      duration: "Self-paced",
      category: "Tutorial",
      url: "https://www.youtube.com/"
    }
  ]
});

export default function RoleAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "Software Engineer";
  const hasResume = location.state?.hasResume || false;
  const resumeFileName = location.state?.resumeFileName || null;
  const aiAnalysis = location.state?.analysis;
  
  const [activeTab, setActiveTab] = useState<'skills' | 'tools' | 'languages' | 'resources'>('skills');

  // Helper to convert AI analysis to Role Data structure
  const getAiRoleData = (analysis: any, roleName: string) => {
    const defaultData = getDefaultRoleData(roleName);
    
    return {
      ...defaultData,
      title: analysis.suggestedRole || roleName,
      description: `AI-analyzed career path based on your experience. Level: ${analysis.experienceLevel || 'Intermediate'}.`,
      skills: analysis.skills?.map((skill: string) => ({
        name: skill,
        level: analysis.experienceLevel || "Intermediate",
        priority: "High Priority",
        timeToLearn: "Varies"
      })) || defaultData.skills,
      // Keep other fields from default or expand if AI provides them
      resources: defaultData.resources
    };
  };

  // Get role data: prioritize AI analysis, then static DB, then default
  const roleData = aiAnalysis 
    ? getAiRoleData(aiAnalysis, role)
    : (roleDatabase[role] || getDefaultRoleData(role));

  const getPriorityColor = (priority: string) => {
    if (priority === "High Priority") return "bg-red-100 text-red-700 border-red-200";
    if (priority === "Medium Priority") return "bg-gray-800 text-white";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Easy") return "bg-green-100 text-green-700";
    if (difficulty === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs mb-2">
                <Award className="w-3 h-3" />
                <span>AI-Powered Analysis</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{roleData.title}</h1>
              <p className="text-sm text-gray-600">{roleData.description}</p>
              {hasResume && resumeFileName && (
                <p className="text-xs text-indigo-600 font-medium mt-1.5">
                  ✓ Resume analyzed: {resumeFileName}
                </p>
              )}
            </div>
            <button 
              onClick={() => {/* Implement PDF download */}}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Job Growth</p>
                <p className="font-semibold text-sm text-gray-900">{roleData.jobGrowth}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Salary Range</p>
                <p className="font-semibold text-sm text-gray-900">{roleData.salaryRange}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-1 mb-4 grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'skills'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Skills
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Tools
          </button>
          <button
            onClick={() => setActiveTab('languages')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'languages'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Languages
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'resources'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Resources
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="space-y-3">
                {roleData.skills.map((skill: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-semibold text-sm text-gray-900">{skill.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(skill.priority)}`}
                        >
                          {skill.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          Level: {skill.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {skill.timeToLearn}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tools & Technologies</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {roleData.tools.map((tool: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{tool.name}</h3>
                        <p className="text-xs text-gray-600">{tool.category}</p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(tool.difficulty)}`}
                      >
                        {tool.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'languages' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Programming Languages & Frameworks</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Programming Languages</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {roleData.languages.map((lang: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Frameworks & Libraries</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {roleData.frameworks.map((framework: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Learning Resources</h2>
              <div className="space-y-3">
                {roleData.resources.map((resource: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900">{resource.name}</h3>
                          <p className="text-xs text-gray-600">{resource.provider}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                              resource.type === 'free'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {resource.type === 'free' ? 'Free' : 'Paid'}
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.duration}
                        </span>
                        <span>{resource.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/roadmap', { state: { role } })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            Continue to Personalized Roadmap
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/resources', { state: { role } })}
            className="px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse All Resources
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
