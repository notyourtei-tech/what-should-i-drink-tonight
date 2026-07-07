'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full bg-[#1a1a1a] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl',
        'animate-slide-up max-h-[85vh] overflow-y-auto',
        sizes[size]
      )}>
        {title && (
          <div className="sticky top-0 bg-[#1a1a1a] flex items-center justify-between px-6 py-4 border-b border-white/[0.05] rounded-t-3xl z-10">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40
                       hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
