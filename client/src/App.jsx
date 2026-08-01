import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LandingView from './views/LandingView.jsx';
import DashboardView from './views/DashboardView.jsx';
import SharedView from './views/SharedView.jsx';
import FavoritesView from './views/FavoritesView.jsx';
import UploadView from './views/UploadView.jsx';

import CreateFolderModal from './components/CreateFolderModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import AuthModal from './components/AuthModal.jsx';

import { api } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Real backend data states (initialized clean with zero/empty values)
  const [stats, setStats] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [favoriteFiles, setFavoriteFiles] = useState([]);

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);

  // Check logged-in user session on load using stored JWT token
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const userData = await api.getMe();
        if (userData) {
          setUser(userData);
          setActiveTab('dashboard');
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    checkAuth();
  }, []);

  // Fetch real data from backend when user is authenticated
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [statsData, filesData, foldersData, favoritesData, sharedData] = await Promise.allSettled([
          api.getStats(),
          api.listFiles(),
          api.listFolders(),
          api.listFavorites(),
          api.listShared(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (filesData.status === 'fulfilled') setFiles(Array.isArray(filesData.value) ? filesData.value : filesData.value?.files || []);
        if (foldersData.status === 'fulfilled') setFolders(Array.isArray(foldersData.value) ? foldersData.value : foldersData.value?.folders || []);
        if (favoritesData.status === 'fulfilled') setFavoriteFiles(Array.isArray(favoritesData.value) ? favoritesData.value : favoritesData.value?.favorites || []);
        if (sharedData.status === 'fulfilled') setSharedFiles(Array.isArray(sharedData.value) ? sharedData.value : sharedData.value?.shares || []);
      } catch (err) {
        console.error('Error fetching backend data:', err);
      }
    }

    loadData();
  }, [user, activeTab]);

  // Auth Handlers
  const handleLogin = async (credentials) => {
    try {
      const data = await api.login(credentials);
      if (data?.user) {
        setUser(data.user);
        setActiveTab('dashboard');
      }
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  const handleRegister = async (userData) => {
    try {
      const data = await api.register(userData);
      if (data?.user) {
        setUser(data.user);
        setActiveTab('dashboard');
      }
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setStats(null);
    setFiles([]);
    setFolders([]);
    setFavoriteFiles([]);
    setSharedFiles([]);
    setActiveTab('landing');
  };

  // File Handlers
  const handleFileUpload = async (filesList, targetFolderId = null) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    for (let file of filesList) {
      const formData = new FormData();
      formData.append('file', file);
      if (targetFolderId) {
        formData.append('folderId', targetFolderId);
      }
      try {
        await api.uploadFile(formData);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    // Refresh file list & stats
    try {
      const [resFiles, resFolders, resStats] = await Promise.all([
        api.listFiles(),
        api.listFolders(),
        api.getStats(),
      ]);
      setFiles(Array.isArray(resFiles) ? resFiles : resFiles?.files || []);
      setFolders(Array.isArray(resFolders) ? resFolders : resFolders?.folders || []);
      setStats(resStats);
    } catch (e) { }
  };

  const handleCreateFolder = async (folderName) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      await api.createFolder(folderName);
      const resFolders = await api.listFolders();
      setFolders(Array.isArray(resFolders) ? resFolders : resFolders?.folders || []);
    } catch (err) {
      console.error('Create folder error:', err);
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folder.name}" and all its files?`)) {
      return;
    }
    try {
      await api.deleteFolder(folder.id);
      const [resFiles, resFolders, resStats] = await Promise.all([
        api.listFiles(),
        api.listFolders(),
        api.getStats(),
      ]);
      setFiles(Array.isArray(resFiles) ? resFiles : resFiles?.files || []);
      setFolders(Array.isArray(resFolders) ? resFolders : resFolders?.folders || []);
      setStats(resStats);
    } catch (err) {
      console.error('Delete folder error:', err);
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      await api.deleteFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      const resStats = await api.getStats();
      setStats(resStats);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleFavorite = async (file) => {
    try {
      if (file.favoriteId) {
        await api.removeFavorite(file.favoriteId);
      } else {
        const targetFileId = file.fileId || file.id;
        await api.toggleFavorite(targetFileId);
      }
      const resFavs = await api.listFavorites();
      setFavoriteFiles(Array.isArray(resFavs) ? resFavs : resFavs?.favorites || []);
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const handleShareFile = (file) => {
    setSelectedFileForShare(file);
    setIsShareModalOpen(true);
  };

  const handleDownloadFile = (file) => {
    const token = localStorage.getItem('token');
    const downloadUrl = `/api/files/${file.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  // Filter files by search query
  const filteredFiles = files.filter((f) =>
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If on landing view
  if (activeTab === 'landing') {
    return (
      <>
        <LandingView
          onStartUploading={() => {
            if (user) {
              setActiveTab('dashboard');
            } else {
              setIsAuthOpen(true);
            }
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#EBF1FA] font-sans antialiased">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeTab === 'dashboard' && (
          <DashboardView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            stats={stats}
            files={filteredFiles}
            folders={folders}
            onCreateFolder={() => setIsFolderModalOpen(true)}
            onUploadClick={() => setActiveTab('upload')}
            onUploadToFolder={handleFileUpload}
            onDeleteFolder={handleDeleteFolder}
            onShareFile={handleShareFile}
            onDeleteFile={handleDeleteFile}
            onToggleFavorite={handleToggleFavorite}
            onDownloadFile={handleDownloadFile}
          />
        )}

        {activeTab === 'shared' && (
          <SharedView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sharedFiles={sharedFiles}
            onAddSharedFolder={() => setIsFolderModalOpen(true)}
            onShareFile={handleShareFile}
            onDeleteFile={handleDeleteFile}
            onToggleFavorite={handleToggleFavorite}
            onDownloadFile={handleDownloadFile}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            favoriteFiles={favoriteFiles}
            onShareFile={handleShareFile}
            onRemoveFavorite={handleToggleFavorite}
            onDownloadFile={handleDownloadFile}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView onUploadFiles={handleFileUpload} />
        )}
      </main>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedFileForShare(null);
        }}
        file={selectedFileForShare}
        onShare={async (file, email) => {
          try {
            await api.createShareLink(file.id);
          } catch (e) { }
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
