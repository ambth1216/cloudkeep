import React, { useState, useRef } from 'react';
import { UploadCloud, Check, X, Loader2, Music, Camera, FileText } from 'lucide-react';

export default function UploadView({ onUploadFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (filesList) => {
    const newItems = Array.from(filesList).map((file, idx) => ({
      id: `u-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      progress: 100,
      status: 'completed',
      fileObj: file,
    }));

    setUploadQueue((prev) => [...newItems, ...prev]);
    onUploadFiles && onUploadFiles(filesList);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeUploadItem = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 bg-[#EBF1FA] p-6 lg:p-8 min-h-screen overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8 mt-4">
        {/* Main Upload Dropzone Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 text-center">
          <h2 className="text-2xl font-extrabold text-[#0B3B7B]">Upload files</h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-200 bg-[#F8FAFC]'
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-[#2F80ED] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-lg">
                Drag & drop your files here
              </h4>
              <p className="text-xs text-slate-400 font-medium">or</p>
            </div>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-xl border border-blue-400 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm"
            >
              Choose files from your computer
            </button>
          </div>
        </div>

        {/* Upload Progress Section */}
        {uploadQueue.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Upload progress</span>
            </div>

            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 space-x-4"
                >
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  {/* Info & Progress bar */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                      <span className="text-slate-400 font-medium pl-2">{item.progress}%</span>
                    </div>

                    {/* Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 pl-2">
                    {item.status === 'completed' || item.progress === 100 ? (
                      <Check className="w-5 h-5 text-teal-500" />
                    ) : (
                      <button
                        onClick={() => removeUploadItem(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
