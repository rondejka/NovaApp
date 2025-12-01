import React from 'react';
import { Sparkles } from 'lucide-react';

export default function NovaLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      <div className="relative group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-rose-200/50 transition-transform group-hover:scale-105 duration-500">
          <Sparkles className="w-6 h-6 text-white fill-white/20" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border-2 border-white animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-purple-300 rounded-full border-2 border-white" />
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 font-sans leading-none pb-1">
          NOVA
        </h1>
      </div>
    </div>
  );
}