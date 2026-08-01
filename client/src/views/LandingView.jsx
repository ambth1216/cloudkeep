import React from 'react';
import { ArrowRight, Cloud, Folder } from 'lucide-react';

export default function LandingView({ onStartUploading }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-5xl border border-slate-100 flex flex-col md:flex-row min-h-[580px]">
        {/* Left Hero Content */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-blue-900 tracking-tight">CloudKeep</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B3B7B] leading-tight mb-4">
            All your files in <br className="hidden md:inline" />
            one safe place
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            Free file storage for everyone. Store your documents, music, images for a low price.
          </p>

          <div>
            <button
              onClick={onStartUploading}
              className="bg-[#2F80ED] hover:bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 inline-flex items-center space-x-2 text-sm group"
            >
              <span>Start uploading</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Artwork Panel */}
        <div className="w-full md:w-1/2 bg-[#F0F6FF] p-8 relative flex items-center justify-center overflow-hidden min-h-[340px] md:min-h-auto">
          {/* Main Giant Central Cloud */}
          <div className="relative w-72 h-44 md:w-80 md:h-52 bg-[#2F80ED] rounded-full shadow-2xl flex items-center justify-center animate-pulse duration-1000">
            <div className="absolute -top-12 left-10 w-36 h-36 bg-[#2F80ED] rounded-full"></div>
            <div className="absolute -top-16 right-10 w-44 h-44 bg-[#2F80ED] rounded-full"></div>

            {/* Floating Folders artwork around the central cloud */}
            {/* Top Pink Folder */}
            <div className="absolute -top-24 left-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/50 transform -rotate-6 animate-bounce">
              <div className="w-16 h-12 bg-pink-400 rounded-xl relative shadow-md flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Top Right Blue Folder */}
            <div className="absolute -top-10 -right-8 bg-white/70 backdrop-blur-md p-3.5 rounded-3xl shadow-lg border border-white/50 transform rotate-6">
              <div className="w-14 h-10 bg-blue-500 rounded-xl relative shadow-md flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Bottom Purple Folder */}
            <div className="absolute -bottom-16 left-6 bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/50 transform -rotate-3">
              <div className="w-16 h-12 bg-purple-500 rounded-xl relative shadow-md flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Bottom Right Teal Folder */}
            <div className="absolute -bottom-24 right-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/50 transform rotate-12">
              <div className="w-16 h-12 bg-teal-400 rounded-xl relative shadow-md flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
