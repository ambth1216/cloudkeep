import React, { useState } from 'react';
import { Camera, Video, Mic, FileText, Share2, MoreHorizontal, Download, Star, Trash2 } from 'lucide-react';

function getFileCategory(mimeType = '', filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    return { icon: Camera, bg: 'bg-[#6C5CE7]', label: `${ext.toUpperCase()} file` };
  }
  if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
    return { icon: Video, bg: 'bg-[#FF7675]', label: `${ext.toUpperCase()} file` };
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'aac', 'ogg'].includes(ext)) {
    return { icon: Mic, bg: 'bg-[#0984E3]', label: `${ext.toUpperCase()} file` };
  }
  return { icon: FileText, bg: 'bg-[#00B894]', label: `${ext.toUpperCase()} file` };
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileList({ files = [], onShare, onDelete, onToggleFavorite, onDownload }) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100 shadow-sm">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
        <p className="text-sm font-medium">No files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const { icon: FileIcon, bg: iconBg, label: formatLabel } = getFileCategory(file.mimeType, file.name);
        const isOpen = activeMenuId === file.id;

        return (
          <div
            key={file.id || file.name}
            className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 group"
          >
            {/* Left: Icon & Name */}
            <div className="flex items-center space-x-4 min-w-0 flex-1 pr-4">
              <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
                <FileIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm truncate">{file.name}</h4>
                <p className="text-xs text-slate-400 md:hidden">{formatLabel} • {formatBytes(file.size)}</p>
              </div>
            </div>

            {/* Middle Specs: Format & Size */}
            <div className="hidden md:flex items-center space-x-12 text-xs font-medium text-slate-400 min-w-[220px] justify-between">
              <span className="w-24 uppercase truncate">{formatLabel}</span>
              <span className="w-20 text-right">{formatBytes(file.size)}</span>
            </div>

            {/* Shared Member Avatars if any */}
            {file.sharedWith && file.sharedWith.length > 0 && (
              <div className="hidden lg:flex items-center -space-x-2 mr-6 shrink-0">
                {file.sharedWith.slice(0, 3).map((user, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden text-[10px] font-bold flex items-center justify-center text-slate-600"
                    title={user.name || user.email}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center space-x-2 shrink-0 relative">
              <button
                onClick={() => onShare && onShare(file)}
                title="Share"
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(isOpen ? null : file.id)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setActiveMenuId(null)}
                  >
                    <button
                      onClick={() => {
                        onDownload && onDownload(file);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleFavorite && onToggleFavorite(file);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                      <span>{file.isFavorite ? 'Remove Favorite' : 'Add Favorite'}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        onDelete && onDelete(file);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
