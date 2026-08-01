import React from 'react';
import { Cloud, Users, Star, UploadCloud, LogOut, User } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'My cloud', icon: Cloud },
    { id: 'shared', label: 'Shared files', icon: Users },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'upload', label: 'Upload files', icon: UploadCloud },
  ];

  return (
    <aside className="w-64 bg-[#0B3B7B] text-white flex flex-col justify-between p-6 shrink-0 min-h-screen select-none">
      <div>
        {/* Profile Avatar Header */}
        <div className="flex items-center space-x-3 mb-10 pl-2 pt-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-inner bg-slate-700 flex items-center justify-center text-white font-semibold text-lg shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.name || user?.email ? (
              (user.name || user.email).charAt(0).toUpperCase()
            ) : (
              <User className="w-6 h-6 text-slate-300" />
            )}
          </div>
          {user && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name || user.email}</p>
              <p className="text-xs text-blue-200 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-left ${isActive
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-200/90'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1 pt-6 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-left text-blue-100/80 hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="w-5 h-5 text-blue-200/90" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
