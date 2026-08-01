import React from 'react';
import { Camera, FileText, Video, Mic, Star } from 'lucide-react';

const CATEGORY_STYLES = {
  pictures: {
    bg: 'bg-[#6C5CE7]',
    icon: Camera,
    label: 'Pictures',
    hasStar: true,
  },
  documents: {
    bg: 'bg-[#00B894]',
    icon: FileText,
    label: 'Documents',
    hasStar: false,
  },
  videos: {
    bg: 'bg-[#FF7675]',
    icon: Video,
    label: 'Videos',
    hasStar: false,
  },
  audio: {
    bg: 'bg-[#0984E3]',
    icon: Mic,
    label: 'Audio',
    hasStar: false,
  },
};

export default function CategoryCard({ type, count, isSelected, onClick }) {
  const config = CATEGORY_STYLES[type] || CATEGORY_STYLES.documents;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`${config.bg} text-white p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 transform hover:-translate-y-1 relative flex flex-col justify-between h-32 select-none ${
        isSelected ? 'ring-4 ring-offset-2 ring-blue-500 scale-[1.02]' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl inline-flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {config.hasStar && (
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-base leading-snug">{config.label}</h4>
        <p className="text-xs text-white/80 font-normal">{count} files</p>
      </div>
    </div>
  );
}
