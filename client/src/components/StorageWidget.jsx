import React from 'react';
import { UploadCloud, Plus, Users } from 'lucide-react';

export default function StorageWidget({ stats, onUploadClick, sharedFolders = [], onAddSharedFolder }) {
  const storageUsedStr = stats?.storageUsed || '0 B';
  const storageLimitStr = stats?.storageLimit || '0 B';
  const percentUsed = stats?.storagePercentage ?? 0;
  const percentLeft = Math.max(0, 100 - percentUsed);

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Top Upload Box */}
      <div
        onClick={onUploadClick}
        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center space-y-3 group h-56"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="font-bold text-slate-800 text-base">Add new files</p>
      </div>

      {/* Storage Usage Widget */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-800 text-sm">Your storage</h4>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {percentLeft}% left
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {storageUsedStr} of {storageLimitStr} used
        </p>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Shared Folders List Widget */}

    </div>
  );
}
