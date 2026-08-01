import React, { useState, useRef } from 'react';
import Header from '../components/Header.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import FileList from '../components/FileList.jsx';
import StorageWidget from '../components/StorageWidget.jsx';
import { Plus, Folder, ChevronLeft, UploadCloud, X, Trash2 } from 'lucide-react';

function matchesCategory(file, cat) {
  if (!cat) return true;
  const mime = (file.mimeType || '').toLowerCase();
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';

  if (cat === 'pictures') {
    return mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  }
  if (cat === 'videos') {
    return mime.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext);
  }
  if (cat === 'audio') {
    return mime.startsWith('audio/') || ['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(ext);
  }
  if (cat === 'documents') {
    return (
      mime.startsWith('application/pdf') ||
      mime.startsWith('text/') ||
      mime.includes('word') ||
      mime.includes('excel') ||
      mime.includes('spreadsheet') ||
      mime.includes('presentation') ||
      ['pdf', 'docx', 'doc', 'txt', 'xlsx', 'pptx', 'csv', 'json'].includes(ext) ||
      (!mime.startsWith('image/') && !mime.startsWith('video/') && !mime.startsWith('audio/'))
    );
  }
  return true;
}

export default function DashboardView({
  searchQuery,
  setSearchQuery,
  stats,
  files = [],
  folders = [],
  sharedFolders = [],
  onCreateFolder,
  onUploadClick,
  onUploadToFolder,
  onDeleteFolder,
  onShareFile,
  onDeleteFile,
  onToggleFavorite,
  onDownloadFile,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const folderFileInputRef = useRef(null);

  // Compute live category counts from files array
  const liveCategoryCounts = {
    pictures: files.filter((f) => matchesCategory(f, 'pictures')).length,
    documents: files.filter((f) => matchesCategory(f, 'documents')).length,
    videos: files.filter((f) => matchesCategory(f, 'videos')).length,
    audio: files.filter((f) => matchesCategory(f, 'audio')).length,
  };

  const handleCategoryToggle = (type) => {
    setSelectedCategory((prev) => (prev === type ? null : type));
  };

  const handleFolderFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0 && currentFolder) {
      onUploadToFolder && onUploadToFolder(e.target.files, currentFolder.id);
    }
  };

  // Filter files based on search query, current folder, and selected category
  const filteredFiles = files.filter((f) => {
    // Search query filter
    const matchesSearch = (f.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Folder filter
    if (currentFolder) {
      if (f.folderId !== currentFolder.id) return false;
    }

    // Category filter
    if (selectedCategory) {
      if (!matchesCategory(f, selectedCategory)) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 bg-[#EBF1FA] p-6 lg:p-8 min-h-screen overflow-y-auto">
      {/* Search Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Workspace Area */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Active Folder Header / Breadcrumb */}
          {currentFolder ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors flex items-center space-x-1 font-semibold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to My Cloud</span>
                </button>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center space-x-2">
                  <Folder className="w-5 h-5 text-red-500" />
                  <h2 className="font-extrabold text-slate-800 text-lg">{currentFolder.name}</h2>
                </div>
              </div>

              {/* Upload directly to this folder & Delete Folder */}
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  multiple
                  ref={folderFileInputRef}
                  onChange={handleFolderFileInput}
                  className="hidden"
                />
                <button
                  onClick={() => folderFileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-sm text-xs flex items-center space-x-2 transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload to folder</span>
                </button>
                <button
                  onClick={() => {
                    if (onDeleteFolder) {
                      onDeleteFolder(currentFolder);
                      setCurrentFolder(null);
                    }
                  }}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors flex items-center space-x-1.5 font-semibold text-xs"
                  title="Delete this folder"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete folder</span>
                </button>
              </div>
            </div>
          ) : (
            /* Categories Section */
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg">Categories</h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Filter ({selectedCategory})</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <CategoryCard
                  type="pictures"
                  count={liveCategoryCounts.pictures || stats?.picturesCount || 0}
                  isSelected={selectedCategory === 'pictures'}
                  onClick={() => handleCategoryToggle('pictures')}
                />
                <CategoryCard
                  type="documents"
                  count={liveCategoryCounts.documents || stats?.documentsCount || 0}
                  isSelected={selectedCategory === 'documents'}
                  onClick={() => handleCategoryToggle('documents')}
                />
                <CategoryCard
                  type="videos"
                  count={liveCategoryCounts.videos || stats?.videosCount || 0}
                  isSelected={selectedCategory === 'videos'}
                  onClick={() => handleCategoryToggle('videos')}
                />
                <CategoryCard
                  type="audio"
                  count={liveCategoryCounts.audio || stats?.audioCount || 0}
                  isSelected={selectedCategory === 'audio'}
                  onClick={() => handleCategoryToggle('audio')}
                />
              </div>
            </section>
          )}

          {/* Folders Section (Only shown when not inside a specific folder) */}
          {!currentFolder && (
            <section className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Folders</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {folders.map((folder) => {
                  const folderFilesCount = files.filter((f) => f.folderId === folder.id).length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder)}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 group relative"
                    >
                      <div className="flex items-center justify-between">
                        <Folder className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFolder && onDeleteFolder(folder);
                          }}
                          title="Delete folder"
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm truncate">{folder.name}</h5>
                        <p className="text-xs text-slate-400">
                          {folderFilesCount || folder._count?.files || 0} files
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Add Folder Card */}
                <div
                  onClick={onCreateFolder}
                  className="bg-white/60 hover:bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-200 flex items-center justify-center h-28 text-blue-500 group"
                  title="Create New Folder"
                >
                  <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </section>
          )}

          {/* Recent / Filtered Files Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {currentFolder
                  ? `Files in ${currentFolder.name}`
                  : selectedCategory
                  ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Files`
                  : 'Recent files'}
              </h3>

              {(selectedCategory || currentFolder) && (
                <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <FileList
              files={filteredFiles}
              onShare={onShareFile}
              onDelete={onDeleteFile}
              onToggleFavorite={onToggleFavorite}
              onDownload={onDownloadFile}
            />
          </section>
        </div>

        {/* Right Panel Storage & Shared Widget */}
        <StorageWidget
          stats={stats}
          sharedFolders={sharedFolders}
          onUploadClick={onUploadClick}
          onAddSharedFolder={onCreateFolder}
        />
      </div>
    </div>
  );
}
