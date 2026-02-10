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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-medium mb-6 shadow-md shadow-indigo-200">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Matching
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
          Let's Find Your Perfect Match
        </h1>
        <p className="text-gray-500 mb-10">
          Tell us what you're looking for or upload your resume
        </p>

        {/* Role Input */}
        <div className="text-left mb-8">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            What role are you looking for?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
              placeholder="Type role (e.g., Software Engineer, Designer, Product Manager...)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            AI will suggest relevant projects based on your input
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="text-left mb-8">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Upload your resume for better matches
          </label>
          
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
              <div className="flex items-center bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100">
                <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                <div className="text-left mr-4">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 text-gray-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-gray-900 font-medium mb-1">
                  Drop your resume here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse from your computer
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                  Browse Files
                </button>
              </>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button 
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
          >
            Find My Perfect Projects
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}
