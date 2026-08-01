import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { api } from '../services/api.js';

export default function ShareModal({ isOpen, onClose, file, onShare }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file?.id) {
      setLoading(true);
      api.createShareLink(file.id)
        .then((res) => {
          const token = res?.token || res?.data?.token;
          if (token) {
            setShareUrl(`${window.location.origin}/api/share/public/${token}`);
          } else {
            setShareUrl(`${window.location.origin}/api/share/public/${file.id}`);
          }
        })
        .catch((err) => {
          console.error('Error generating share token:', err);
          setShareUrl(`${window.location.origin}/api/share/public/${file.id}`);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Share File</h3>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Public share link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={loading ? 'Generating public link...' : shareUrl}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              disabled={loading || !shareUrl}
              className="px-4 py-2.5 bg-slate-800 text-white rounded-2xl text-xs font-semibold hover:bg-slate-900 transition-colors flex items-center space-x-1 shrink-0 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
