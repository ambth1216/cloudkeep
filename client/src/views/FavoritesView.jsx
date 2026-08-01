import React from 'react';
import Header from '../components/Header.jsx';
import FileList from '../components/FileList.jsx';
import { Star } from 'lucide-react';

export default function FavoritesView({
  searchQuery,
  setSearchQuery,
  favoriteFiles = [],
  onShareFile,
  onRemoveFavorite,
  onDownloadFile,
}) {
  // Extract file object from favorite wrapper and set isFavorite flag to true
  const displayFavorites = favoriteFiles
    .map((fav) => {
      const target = fav.item || fav.file || fav;
      return {
        ...target,
        favoriteId: fav.id,
        isFavorite: true,
      };
    })
    .filter((f) => (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 bg-[#EBF1FA] p-6 lg:p-8 min-h-screen overflow-y-auto">
      {/* Search Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B3B7B]">Favorites</h2>

        {/* Favorites List Section */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Favorite Files</h3>

          {displayFavorites.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm space-y-3">
              <Star className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <div>
                <p className="text-base font-semibold text-slate-700">No favorites added yet</p>
                <p className="text-xs text-slate-400 mt-1">Star any file from your cloud to quick-access it here.</p>
              </div>
            </div>
          ) : (
            <FileList
              files={displayFavorites}
              onShare={onShareFile}
              onDelete={onRemoveFavorite}
              onToggleFavorite={onRemoveFavorite}
              onDownload={onDownloadFile}
            />
          )}
        </section>
      </div>
    </div>
  );
}
