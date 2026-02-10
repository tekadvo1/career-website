import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Sparkles, FileText, X } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Please upload a PDF, DOC, or DOCX file.');
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!role && !file) {
      alert('Please enter a role or upload a resume');
      return;
    }

    if (file) {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('resume', file);

      try {
        const response = await fetch('/api/resume/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze resume');
        }

        const data = await response.json();
        
        navigate('/role-analysis', {
          state: {
            role: data.analysis.suggestedRole || role || 'General Career Path',
            hasResume: true,
            resumeFileName: file.name,
            analysis: data.analysis
          }
        });
      } catch (error) {
        console.error('Error analyzing resume:', error);
        alert('Failed to analyze resume. Please try again or skip using role input only.');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Show loading state briefly for UX consistency
      setIsAnalyzing(true);
      setTimeout(() => {
        // Navigate using just the role if no file
        navigate('/role-analysis', {
          state: {
            role: role || 'General Career Path',
            hasResume: false,
            resumeFileName: null
          }
        });
        setIsAnalyzing(false);
      }, 800);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
        
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
                    >
                      {suggestion}
                      <span className="opacity-0 group-hover:opacity-100 text-indigo-400 text-xs">Select</span>
                    </button>
                  ))}
                </div>
              )}
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
                  file ? 'Analyze Resume & Find Matches' : 'Find Matches for Role'
                )}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
              >
                Skip
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

      </div>
    </div>
  );
}
