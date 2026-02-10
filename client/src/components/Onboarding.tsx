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
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col h-full max-h-[600px]">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-medium mb-4 shadow-md shadow-indigo-200">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Matching
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Let's Find Your Perfect Match
          </h1>
          <p className="text-gray-500 mt-2">
            Tell us what you're looking for or upload your resume for instant recommendations.
          </p>
        </div>

        {/* Main Content Split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* LEFT: Role Input */}
          <div className="flex flex-col justify-center h-full">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              What role are you looking for?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="e.g. Software Engineer, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <p className="mt-3 text-sm text-gray-400">
              AI will analyze open projects and suggest the best fits based on your desired role.
            </p>

            <div className="mt-8 hidden md:block">
               <div className="flex gap-4">
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                >
                  Find Matches
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Skip
                </button>
               </div>
            </div>
          </div>

          {/* RIGHT: Upload Resume */}
          <div className="h-full flex flex-col">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              Upload your resume
            </label>
            <div 
              className={`flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
                <div className="flex flex-col items-center text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100 w-full">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <FileText className="w-10 h-10 text-indigo-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 truncate max-w-full mb-1">{file.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove File
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-2">
                    Drop resume here
                  </p>
                  <p className="text-gray-500 text-center mb-6">
                    Support for PDF, DOC, DOCX
                  </p>
                  <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                    Browse Files
                  </button>
                </>
              )}
            </div>
             <p className="mt-3 text-center text-xs text-gray-400">
               Max file size: 5MB
             </p>
          </div>
        </div>

        {/* Mobile Buttons (Visible only on small screens) */}
        <div className="mt-8 md:hidden flex flex-col gap-3">
            <button 
              onClick={handleSubmit}
              className="w-full py-3 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-base font-medium text-white hover:bg-indigo-700"
            >
              Find Matches
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
        </div>

      </div>
    </div>
  );
}
