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
  ExternalLink,
  Clock,
  Award
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
  
  const [activeTab, setActiveTab] = useState<'skills' | 'tools' | 'languages' | 'resources'>('skills');

  // Get role data or use default
  const roleData = roleDatabase[role] || getDefaultRoleData(role);

  // Enhanced analysis message when resume is uploaded
  const analysisMessage = hasResume 
    ? "AI analyzed your resume and role to provide personalized recommendations"
    : "Analysis based on your selected role";

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
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Main Container Box */}
      <div className="w-full max-w-5xl h-full max-h-[95vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="border-b flex-shrink-0 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                <Award className="w-3 h-3 mr-1" />
                AI Analysis
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Download className="w-3 h-3" />
                PDF
              </button>
            </div>

            {/* Resume Analysis Banner */}
            {hasResume && resumeFileName && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Award className="w-3 h-3" />
                  <p className="text-xs font-semibold">Resume: {resumeFileName}</p>
                </div>
              </div>
            )}

            <h1 className="text-xl font-bold text-gray-900 mb-1">{roleData.title}</h1>
            <p className="text-gray-600 text-xs mb-1">{roleData.description}</p>
            <p className="text-xs text-indigo-600 font-medium mb-3">
              {analysisMessage}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-center gap-1 text-green-700 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">Job Growth</span>
                </div>
                <p className="text-xs font-bold text-green-900">{roleData.jobGrowth}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center gap-1 text-blue-700 mb-0.5">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-xs font-semibold">Salary Range</span>
                </div>
                <p className="text-xs font-bold text-blue-900">{roleData.salaryRange}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="border-b flex-shrink-0 bg-white">
        <div className="px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                activeTab === 'skills'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" />
              Skills
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                activeTab === 'tools'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wrench className="w-3 h-3 inline mr-1" />
              Tools
            </button>
            <button
              onClick={() => setActiveTab('languages')}
              className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                activeTab === 'languages'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" />
              Languages
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                activeTab === 'resources'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-3 h-3 inline mr-1" />
              Resources
            </button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-4">
          {activeTab === 'skills' && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Required Skills</h2>
              <div className="space-y-2">
                {roleData.skills.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Award className="w-3 h-3 text-indigo-600" />
                        <h3 className="font-semibold text-gray-900 text-xs">{skill.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-0.5">
                          <Code className="w-3 h-3" />
                          {skill.level}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {skill.timeToLearn}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(skill.priority)}`}>
                      {skill.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Tools & Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {roleData.tools.map((tool: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">{tool.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium">{tool.category}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(tool.difficulty)}`}>
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
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Programming Languages & Frameworks</h2>
              
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-700 mb-2">Programming Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {roleData.languages.map((lang: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-200">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">Frameworks & Libraries</h3>
                <div className="flex flex-wrap gap-1.5">
                  {roleData.frameworks.map((framework: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                      {framework}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Learning Resources</h2>
              <div className="space-y-2">
                {roleData.resources.map((resource: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <BookOpen className="w-3 h-3 text-indigo-600" />
                          <h3 className="font-bold text-gray-900 text-xs">{resource.name}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{resource.provider}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </span>
                          <span>•</span>
                          <span>{resource.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          resource.type === 'free' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {resource.type === 'free' ? 'Free' : 'Paid'}
                        </span>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="border-t flex-shrink-0 bg-white">
        <div className="px-6 py-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}
