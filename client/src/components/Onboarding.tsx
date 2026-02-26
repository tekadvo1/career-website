import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Sparkles, FileText, X, CheckCircle, TrendingUp, Plus } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [country, setCountry] = useState('USA'); // New state for country
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'input' | 'choose-path'>('input');
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // PDF and DOCX are supported
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Please upload a PDF or DOCX file.');
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!role && !file) {
      alert('Please enter a desired role OR upload a PDF resume to continue.');
      return;
    }

    if (file) {
      setIsAnalyzing(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const formData = new FormData();
      formData.append('resume', file);
      if (userId) formData.append('userId', userId);

      try {
        const response = await fetch('/api/resume/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze resume');
        }

        const data = await response.json();
        
        // Update local user state
        if (userId) {
            const updatedUser = { ...user, onboarding_completed: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setAnalysisData(data.analysis);
        setStep('choose-path');
      } catch (error: any) {
        console.error('Error analyzing resume:', error);
        alert(`Resume Analysis Failed: ${error.message || 'Unknown error'}. \n\nPlease try entering your desired role manually instead.`);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Navigate immediately and let RoleAnalysis handle the fetching
      
      // We don't mark onboarding complete here because RoleAnalysis API will do it (if we passed userId)
      // Wait, RoleAnalysis API handles it, but we need to pass userId later?
      // RoleAnalysis extracts user from localStorage anyway.
      
      navigate('/role-analysis', {
        state: {
          role: role || 'General Career Path',
          experienceLevel,
          country,
          hasResume: false,
          resumeFileName: null,
          analysis: null // Explicitly null to trigger fetch in RoleAnalysis
        }
      });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
        
        {step === 'input' && (
          <>
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold mb-4">
            <Sparkles className="w-3 h-3 mr-1.5" />
            AI-Powered Matching
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Let's Find Your Perfect Match
          </h1>
          <p className="text-gray-600 text-sm">
            Tell us what you're looking for or upload your resume for instant recommendations.
          </p>
        </div>

        {/* Main Content - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* LEFT SIDE: Role Input */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              What role are you looking for?
            </h2>
            
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. Software Engineer, Product Manager"
                value={role}
                onChange={(e) => {
                  const value = e.target.value;
                  setRole(value);
                  if (value.length > 1) {
                    const matches = [
                      "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
                      "Product Manager", "Product Designer", "UI/UX Designer",
                      "Data Scientist", "Data Analyst", "Machine Learning Engineer",
                      "DevOps Engineer", "Cloud Architect", "Cybersecurity Analyst",
                      "Mobile App Developer", "Game Developer", "Blockchain Developer",
                      "QA Engineer", "Technical Writer", "Systems Administrator"
                    ].filter(r => r.toLowerCase().includes(value.toLowerCase()));
                    setSuggestions(matches);
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => role.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* AI Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border-b border-indigo-100 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    AI Suggested Roles
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-between group"
                      onClick={() => {
                        setRole(suggestion);
                        setShowSuggestions(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {suggestion}
                      <span className="opacity-0 group-hover:opacity-100 text-indigo-400 text-xs">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      experienceLevel === level
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Target Country
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['USA', 'India', 'UK', 'Australia', 'Canada'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`py-1.5 text-xs font-semibold rounded-md border transition-all ${
                      country === c
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              AI will analyze open projects and suggest the best fits based on your desired role.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className={`flex-1 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center justify-center ${isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  file ? 'Analyze Resume & Build Plan' : 'Build My Career Plan'
                )}
              </button>

            </div>
          </div>

          {/* RIGHT SIDE: Upload Resume */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Upload your resume
            </h2>
            
            <div 
              className={`flex-1 min-h-[200px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
              
              {file ? (
                <div className="text-center">
                  <div className="inline-flex p-3 bg-indigo-100 rounded-full mb-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1 truncate max-w-full">{file.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-red-600 text-xs font-medium hover:text-red-700 inline-flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" /> Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
                    <Upload className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Drop resume here
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Support for PDF, DOC, DOCX
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Browse Files
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              Max file size: 5MB
            </p>
          </div>
        </div>
        </>
        )}

        {step === 'choose-path' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold mb-6 shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resume Analyzed Successfully
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Choose Your Learning Path
              </h1>
              <p className="text-slate-600 text-base">
                Based on your resume analysis, how would you like to grow?
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Your Current Skills</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData?.technicalSkills?.length > 0 ? analysisData.technicalSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  )) : (
                    analysisData?.existingSkills?.slice(0, 5).map((skill: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium">
                        {skill.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData?.softSkills?.length > 0 ? analysisData.softSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  )) : <span className="text-sm text-slate-400">Analysis didn't extract clear soft skills</span>}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                {analysisData?.summary || analysisData?.description || "Your resume shows a strong foundation."}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Card 1: Master */}
              <button 
                onClick={() => {
                  navigate('/role-analysis', {
                    state: {
                      role: analysisData?.suggestedRole || role || 'Expert',
                      hasResume: true,
                      resumeFileName: file?.name,
                      analysis: null, // trigger new fetch
                      learningPath: 'master' // pass the intent
                    }
                  });
                }}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-start"
              >
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">Develop & Master Current Skills</h3>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Focus on deepening your expertise in the skills you already have. Perfect for strengthening your foundation and becoming an expert.
                </p>
                <ul className="space-y-2 mt-auto">
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2.5"></div>
                    Advanced projects in current stack
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2.5"></div>
                    Best practices & optimization
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2.5"></div>
                    Real-world problem solving
                  </li>
                </ul>
              </button>

              {/* Card 2: Expand */}
              <button 
                onClick={() => {
                  navigate('/role-analysis', {
                    state: {
                      role: analysisData?.suggestedRole || role || 'Next Level Role',
                      hasResume: true,
                      resumeFileName: file?.name,
                      analysis: null, // trigger new fetch
                      learningPath: 'expand' // pass the intent
                    }
                  });
                }}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-cyan-500 hover:shadow-md transition-all flex flex-col items-start"
              >
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">Add New Skills & Expand</h3>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Learn complementary skills to expand your capabilities. Great for career pivots and becoming more versatile.
                </p>
                <ul className="space-y-2 mt-auto">
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-2.5"></div>
                    Trending technologies & tools
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-2.5"></div>
                    Cross-functional skills
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-2.5"></div>
                    Industry-demanded expertise
                  </li>
                </ul>
              </button>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep('input')}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
