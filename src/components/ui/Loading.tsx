'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizes[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 animate-spin" />
      </div>
      {text && <p className="text-sm text-white/35 animate-pulse">{text}</p>}
    </div>
  );
}

export function DrinkLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="text-6xl animate-float">🍸</div>
      <p className="text-gold-400/80 font-medium animate-pulse">正在为你调制推荐...</p>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-gold-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="h-40 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 shimmer rounded-lg" />
        <div className="h-3 w-full shimmer rounded-lg" />
        <div className="flex gap-2">
          <div className="h-5 w-14 shimmer rounded-full" />
          <div className="h-5 w-14 shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}
