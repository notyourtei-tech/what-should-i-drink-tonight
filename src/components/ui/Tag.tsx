'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'gold' | 'outline' | 'filled';
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function Tag({
  children,
  variant = 'outline',
  size = 'md',
  onClick,
  selected = false,
  className,
}: TagProps) {
  const variants = {
    gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    outline: selected
      ? 'bg-gold-500/10 text-gold-400 border-gold-500/30'
      : 'bg-transparent text-white/60 border-white/10',
    filled: selected
      ? 'bg-gold-500 text-black border-gold-500'
      : 'bg-bar-700 text-white/60 border-white/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border transition-all duration-200',
        variants[variant],
        sizes[size],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {children}
    </button>
  );
}
