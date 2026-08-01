import React from 'react';
import { Search } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <div className="w-full mb-6">
      <div className="relative max-w-full">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-white pl-12 pr-6 py-3 rounded-full text-sm text-slate-700 placeholder-slate-400 shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>
    </div>
  );
}
