import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Sparkles, FileText, X } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleSubmit = () => {
    // Here we would upload the resume and save the role
    console.log('Role:', role);
    console.log('File:', file);
    // For now, redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl p-6 md:p-12">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold mb-6 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Matching
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Let's Find Your Perfect Match
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Tell us what you're looking for or upload your resume for instant recommendations.
          </p>
        </div>

        {/* Main Content - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* LEFT SIDE: Role Input */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What role are you looking for?
            </h2>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg text-base bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. Software Engineer, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            
            <p className="text-sm text-gray-500 mb-8">
              AI will analyze open projects and suggest the best fits based on your desired role.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md"
              >
                Find Matches
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
              >
                Skip
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Upload Resume */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upload your resume
            </h2>
            
            <div 
              className={`flex-1 min-h-[280px] border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
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
                  <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-indigo-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-red-600 text-sm font-medium hover:text-red-700 inline-flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    Drop resume here
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Support for PDF, DOC, DOCX
                  </p>
                  <button className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                    Browse Files
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-3">
              Max file size: 5MB
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
