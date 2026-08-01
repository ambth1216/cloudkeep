import React from 'react';
import Header from '../components/Header.jsx';
import FileList from '../components/FileList.jsx';
import { Users } from 'lucide-react';

export default function SharedView({
  searchQuery,
  setSearchQuery,
  sharedFiles = [],
  onShareFile,
  onDeleteFile,
  onToggleFavorite,
  onDownloadFile,
}) {
  // Map shared links array [{ id, token, file: { id, name, size, mimeType } }] to direct file objects
  const displayFiles = sharedFiles.map((share) => {
    if (share.file) {
      return {
        ...share.file,
        shareId: share.id,
        shareToken: share.token,
        expiresAt: share.expiresAt,
      };
    }
    return share;
  }).filter((f) => (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 bg-[#EBF1FA] p-6 lg:p-8 min-h-screen overflow-y-auto">
      {/* Search Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B3B7B]">Your shared files</h2>

        {/* Shared Recently Section */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Shared recently</h3>
          {displayFiles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100 shadow-sm space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium">No files have been shared yet</p>
            </div>
          ) : (
            <FileList
              files={displayFiles}
              onShare={onShareFile}
              onDelete={onDeleteFile}
              onToggleFavorite={onToggleFavorite}
              onDownload={onDownloadFile}
            />
          )}
        </section>
      </div>
    </div>
  );
}
