import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading content...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse shadow-sm">
      <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
      <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
    </div>
  );
};
