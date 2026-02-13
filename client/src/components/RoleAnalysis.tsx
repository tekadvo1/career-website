import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 

  TrendingUp, 
  DollarSign, 
  ChevronRight, 
  Code, 
  BookOpen, 
  Download,
  Wrench, 
  Clock, 
  Award, 
  ExternalLink,
  User, 
  Globe 
} from 'lucide-react';

  /* Removed hardcoded roleDatabase and getDefaultRoleData */

export default function RoleAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  // Using location state first, but falling back to local storage if available for persistence
  const [roleDataState, setRoleDataState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const role = location.state?.role || "Software Engineer";
  const hasResume = location.state?.hasResume || false;
  const resumeFileName = location.state?.resumeFileName || null;
  const aiAnalysis = location.state?.analysis;
  /* New Tab State */
  const [activeTab, setActiveTab] = useState<'skills' | 'tools' | 'languages' | 'resources' | 'daylife' | 'interview'>('skills');
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper to convert AI analysis to Role Data structure with SAFE DEFAULTS
  const getAiRoleData = useCallback((analysis: any, roleName: string) => {
    return {
      title: analysis.title || roleName,
      description: analysis.description || "No description available.",
      jobGrowth: analysis.jobGrowth || "Growth data unavailable",
      salaryRange: analysis.salaryRange || "Salary data unavailable",
      
      // New Data Fields (Safe Access)
      salary_insights: analysis.salary_insights || {
         entry_level: "N/A",
         senior_level: "N/A",
         salary_growth_potential: "Medium",
         negotiation_tips: "Focus on your unique value proposition."
      },
      day_in_the_life: analysis.day_in_the_life || [],
      career_paths: analysis.career_paths || [],
      interview_prep: analysis.interview_prep || [],
      soft_skills: analysis.soft_skills || [],

      skills: analysis.skills || [],
      tools: analysis.tools || [],
      languages: analysis.languages || [],
      frameworks: analysis.frameworks || [],
      resources: analysis.resources || [],
    };
  }, []);

  // Effect to load data from location, local storage, or API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (aiAnalysis) {
          console.log("Using analysis from location state");
          setRoleDataState(getAiRoleData(aiAnalysis, role));
          // Save to local storage for persistence on refresh
          localStorage.setItem('lastRoleAnalysis', JSON.stringify({
            role,
            analysis: aiAnalysis,
            hasResume,
            resumeFileName,
            timestamp: new Date().getTime()
          }));
          setIsLoading(false);
          return;
        }

        // Try to recover from local storage
        const saved = localStorage.getItem('lastRoleAnalysis');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only use if less than 1 hour old and matches current role (if filtered) or just generic valid
          // We check if the saved role matches the requested role if one was requested
          if (parsed.role === role && (new Date().getTime() - parsed.timestamp < 3600000)) {
             console.log("Using analysis from local storage");
             setRoleDataState(getAiRoleData(parsed.analysis, parsed.role));
             setIsLoading(false);
             return;
          }
        }

        // If no state and no valid local storage, FETCH from API
        console.log("Fetching analysis from API for:", role);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        
        const response = await fetch('/api/role/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            role: role, 
            userId: user.id || null, // Pass userId if logged in
            experienceLevel: 'Beginner' // Default or get from user profile
          }) 
        });

        if (!response.ok) {
          throw new Error('Failed to fetch role analysis');
        }

        const data = await response.json();
        if (data.success && data.data) {
           setRoleDataState(getAiRoleData(data.data, role));
           // Save this new fetch to local storage
           localStorage.setItem('lastRoleAnalysis', JSON.stringify({
             role,
             analysis: data.data,
             hasResume: false,
             resumeFileName: null,
             timestamp: new Date().getTime()
           }));
        } else {
           throw new Error('Invalid data received from API');
        }

      } catch (err: any) {
        console.error("Error loading role analysis:", err);
        setError(err.message || "Failed to load analysis");
        // Optional: navigate back to onboarding after a delay or show error button
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [aiAnalysis, role, getAiRoleData, hasResume, resumeFileName]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('role-analysis-content');
    if (!element) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${roleDataState?.title || 'Role_Analysis'}_Roadmap.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Guard clause while loading or error
  if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating comprehensive role guide...</p>
          </div>
        </div>
      );
  }

  if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-lg border border-gray-100">
             <div className="text-red-500 mb-4 text-4xl">⚠️</div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
             <p className="text-gray-600 mb-6">{error}</p>
             <button 
                onClick={() => navigate('/onboarding')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
             >
                Try Again
             </button>
          </div>
        </div>
      );
  }

  if (!roleDataState) return null;

  const roleData = roleDataState;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-6" id="role-analysis-content">
      <div className="max-w-5xl mx-auto">
        

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs mb-3 shadow-sm">
                <Award className="w-3 h-3" />
                <span>AI-Powered Career Guide</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{roleData.title}</h1>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">{roleData.description}</p>
              
              {/* Career Path Quick View */}
              {roleData.career_paths && roleData.career_paths.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                     <span className="font-bold uppercase tracking-wide">Next Steps:</span>
                     {roleData.career_paths.map((path: any, i: number) => (
                        <span key={i} className="bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                           {path.role}
                        </span>
                     ))}
                  </div>
              )}

              {hasResume && resumeFileName && (
                <p className="text-xs text-indigo-600 font-medium mt-2 flex items-center gap-1">
                  ✓ Resume analyzed: <span className="truncate max-w-[200px]">{resumeFileName}</span>
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full md:w-auto disabled:opacity-50"
                >
                  {isDownloading ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>
                <button 
                  onClick={() => navigate('/roadmap', { state: { role, analysis: roleData } })}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md w-full md:w-auto"
                >
                  View Roadmap <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            
            {/* Job Growth */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
               <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-green-100 rounded text-green-600">
                     <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Growth</span>
               </div>
               <p className="font-bold text-sm text-gray-900">{roleData.jobGrowth}</p>
            </div>

            {/* Entry Salary */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
               <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                     <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Entry Level</span>
               </div>
               <p className="font-bold text-sm text-gray-900">{roleData.salary_insights?.entry_level || roleData.salaryRange}</p>
            </div>

            {/* Senior Salary */}
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
               <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
                     <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Senior Level</span>
               </div>
               <p className="font-bold text-sm text-gray-900">{roleData.salary_insights?.senior_level || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Start Scrollable Tabs Container */}
        <div className="bg-white rounded-lg shadow-sm p-1.5 mb-4 overflow-x-auto no-scrollbar">
            <div className="flex md:grid md:grid-cols-6 gap-1.5 min-w-max md:min-w-0">
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'skills' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Award className="w-4 h-4" /> Skills
              </button>
              <button
                onClick={() => setActiveTab('daylife')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'daylife' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" /> Day in Life
              </button>
              <button
                onClick={() => setActiveTab('interview')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" /> Interview
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'tools' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Wrench className="w-4 h-4" /> Tools
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'languages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4" /> Tech
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Resources
              </button>
            </div>
        </div>
        
        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-5">
           
           {/* SKILLS TAB */}
           {activeTab === 'skills' && (
             <div className="space-y-6">
                
                {/* Soft Skills Section */}
                {roleData.soft_skills && roleData.soft_skills.length > 0 && (
                   <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                         <User className="w-5 h-5 text-indigo-500" />
                         Crucial Soft Skills
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                         {roleData.soft_skills.map((skill: any, i: number) => (
                            <div key={i} className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
                               <div className="font-bold text-orange-900 mb-1">{skill.name}</div>
                               <div className="text-sm text-orange-800">{skill.description}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* Hard Skills (Existing Logic) */}
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-3">Technical Skills</h3>
                   <div className="space-y-4">
                     {roleData.skills.length > 0 ? roleData.skills.map((skill: any, index: number) => (
                       <div key={index} className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-all shadow-sm group">
                         <div className="flex items-start gap-4">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${skill.priority?.includes('High') ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                               <Award className="w-5 h-5" />
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                 <h3 className="font-bold text-lg text-gray-900">{skill.name}</h3>
                                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityColor(skill.priority || 'Medium Priority')}`}>
                                   {skill.priority || 'Essential'}
                                 </span>
                               </div>
                               {skill.reason && (
                                  <div className="mb-2 pl-3 border-l-2 border-indigo-200">
                                     <p className="text-sm text-gray-700 leading-relaxed"><span className="font-bold text-indigo-700">Why it matters:</span> {skill.reason}</p>
                                  </div>
                               )}
                               {skill.practical_application && (
                                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                     <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                                        <Code className="w-3.5 h-3.5" /> Practical Application
                                     </div>
                                     <p className="text-sm text-gray-800">{skill.practical_application}</p>
                                  </div>
                               )}
                             </div>
                         </div>
                       </div>
                     )) : <p>No skills data.</p>}
                   </div>
                </div>
             </div>
           )}

           {/* DAY IN THE LIFE TAB (NEW) */}
           {activeTab === 'daylife' && (
              <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">A Day in the Life</h2>
                 <p className="text-gray-500 mb-6">What you can expect on a typical day in this role.</p>

                 <div className="space-y-0 relative border-l-2 border-indigo-100 ml-3 md:ml-6">
                    {roleData.day_in_the_life && roleData.day_in_the_life.length > 0 ? (
                       roleData.day_in_the_life.map((item: any, i: number) => (
                          <div key={i} className="mb-8 ml-6 relative">
                             {/* Timeline Dot */}
                             <div className="absolute -left-[31px] bg-indigo-600 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
                             
                             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded mb-2">
                                   {item.time}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.activity}</h3>
                                <p className="text-gray-600">{item.description}</p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="ml-6 text-gray-500 italic">Day in the life data not available.</div>
                    )}
                 </div>
              </div>
           )}

           {/* INTERVIEW PREP TAB (NEW) */}
           {activeTab === 'interview' && (
              <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Preparation</h2>
                 <p className="text-gray-500 mb-6">Master the most common questions for this role.</p>
                 
                 <div className="space-y-4">
                    {roleData.interview_prep && roleData.interview_prep.length > 0 ? (
                       roleData.interview_prep.map((item: any, i: number) => (
                          <div key={i} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                             <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-start gap-2">
                                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">Q</span>
                                {item.question}
                             </h3>
                             <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                                <div className="font-bold text-indigo-800 text-xs uppercase mb-1">How to Answer</div>
                                <p className="text-indigo-900 leading-relaxed text-sm">
                                   {item.answer_tip}
                                </p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">No interview prep data available.</div>
                    )}
                 </div>

                 {/* Negotiation Tip */}
                 {roleData.salary_insights?.negotiation_tips && (
                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                       <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5" /> Salary Negotiation Tip
                       </h3>
                       <p className="text-green-900 text-sm italic">
                          "{roleData.salary_insights.negotiation_tips}"
                       </p>
                    </div>
                 )}
              </div>
           )}

           {/* TOOLS TAB (Existing) */}
           {activeTab === 'tools' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Essential Tools & Software</h2>
              <p className="text-sm text-gray-500 mb-6">The specific software stack you need to be proficient in.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {roleData.tools.length > 0 ? (
                    roleData.tools.map((tool: any, index: number) => (
                  <div
                    key={index}
                    className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-base text-gray-900">{tool.name}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {tool.category || 'General Tool'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(tool.difficulty || 'Medium')}`}
                      >
                        {tool.difficulty || 'Medium'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                        {tool.description}
                    </p>

                    {/* Usage Context - The "When/How" */}
                    {tool.usage_context && (
                        <div className="mt-auto pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <span className="font-bold text-gray-700 block mb-0.5">Usage in this role:</span>
                                {tool.usage_context}
                            </p>
                        </div>
                    )}
                  </div>
                ))
                ) : (
                    <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No tools data available.</p>
                    </div>
                )}
              </div>
            </div>
          )}

           {/* LANGUAGES TAB (Existing) */}
           {activeTab === 'languages' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Languages & Frameworks</h2>
              
              <div className="space-y-8">
                {roleData.languages && roleData.languages.length > 0 && (
                    <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <Code className="w-4 h-4" /> Core Technical Languages
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {roleData.languages.map((lang: any, index: number) => {
                             // Handle backward compatibility where lang might be a string
                             const langName = typeof lang === 'string' ? lang : lang.name;
                             const langDesc = typeof lang === 'string' ? '' : lang.description;
                             const langUsage = typeof lang === 'string' ? '' : lang.usage;

                             return (
                                <div key={index} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                    <div className="font-bold text-indigo-900 text-lg mb-1">{langName}</div>
                                    {langDesc && <p className="text-sm text-indigo-800 mb-2">{langDesc}</p>}
                                    {langUsage && (
                                        <div className="text-xs text-indigo-700 bg-indigo-100/50 p-2 rounded mt-2">
                                            <strong>Why:</strong> {langUsage}
                                        </div>
                                    )}
                                </div>
                             );
                        })}
                    </div>
                    </div>
                )}

                {roleData.frameworks && roleData.frameworks.length > 0 && (
                    <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <Wrench className="w-4 h-4" /> Key Frameworks & Technologies
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {roleData.frameworks.map((fw: any, index: number) => {
                             // Backward compatibility
                             const fwName = typeof fw === 'string' ? fw : fw.name;
                             const fwDesc = typeof fw === 'string' ? '' : fw.description;
                             const fwUsage = typeof fw === 'string' ? '' : fw.usage;

                             return (
                                <div key={index} className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                                    <div className="font-bold text-purple-900 text-lg mb-1">{fwName}</div>
                                    {fwDesc && <p className="text-sm text-purple-800 mb-2">{fwDesc}</p>}
                                    {fwUsage && (
                                        <div className="text-xs text-purple-700 bg-purple-100/50 p-2 rounded mt-2">
                                            <strong>Why:</strong> {fwUsage}
                                        </div>
                                    )}
                                </div>
                             );
                        })}
                    </div>
                    </div>
                )}
                
                {(!roleData.languages?.length && !roleData.frameworks?.length) && (
                     <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No specific coding languages or frameworks required for this role.</p>
                     </div>
                )}
              </div>
            </div>
          )}

           {/* RESOURCES TAB (Existing) */}
           {activeTab === 'resources' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Curated Learning Resources</h2>
              <p className="text-sm text-gray-500 mb-6">Hand-picked courses and materials to accelerate your learning.</p>

              <div className="space-y-4">
                {roleData.resources.length > 0 ? (
                    roleData.resources.map((resource: any, index: number) => {
                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(resource.name + ' ' + (resource.provider || '') + ' course')}`;
                  const finalUrl = (resource.url && resource.url.startsWith('http')) ? resource.url : searchUrl;

                  return (
                  <a
                    key={index}
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ExternalLink className="w-24 h-24 text-indigo-900 transform rotate-12 -translate-y-4 translate-x-4" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                           <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        
                        <div className="flex-1">
                             <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {resource.name}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                  resource.type?.toLowerCase().includes('free') 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {resource.type || 'Course'}
                                </span>
                             </div>

                             <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mb-3">
                                <span className="flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5" /> {resource.provider || 'Provider'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {resource.duration || 'Self-paced'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> {resource.category || 'Online'}
                                </span>
                             </div>

                             {resource.description && (
                                 <p className="text-sm text-gray-600 leading-relaxed mb-1">
                                    {resource.description}
                                 </p>
                             )}
                        </div>
                        
                        <div className="mt-2 md:mt-0 flex-shrink-0">
                             <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                                 Start Learning <ChevronRight className="w-4 h-4" />
                             </span>
                        </div>
                    </div>
                  </a>
                  );
                })
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No specific resources found.</p>
                    </div>
                )}
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
