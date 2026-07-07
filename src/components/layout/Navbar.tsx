'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/drinks', label: '酒单', icon: '🍸' },
  { href: '/inventory', label: '库存', icon: '🥃' },
  { href: '/favorites', label: '收藏', icon: '❤️' },
  { href: '/profile', label: '我的', icon: '👤' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Desktop Top Nav ── */}
      <nav className={cn(
        'hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-heavy' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center text-xl
                          group-hover:scale-110 group-hover:bg-gold-500/20 transition-all duration-300">
              🥃
            </div>
            <span className="font-display text-lg font-bold gradient-text tracking-tight">
              Tonight Drink
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-gold-400 bg-gold-500/8'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-heavy">
        <div className="flex items-center justify-center h-12 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🥃</span>
            <span className="font-display text-[15px] font-bold gradient-text">
              今晚喝什么
            </span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-heavy safe-area-pb">
        <div className="flex items-center justify-around h-[60px] px-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl',
                  'transition-all duration-200 min-w-[52px] relative',
                  active
                    ? 'text-gold-400 scale-105'
                    : 'text-white/35 hover:text-white/55'
                )}
              >
                <span className={cn(
                  'text-xl transition-all duration-300',
                  active && 'drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]'
                )}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-gold-500 rounded-full shadow-[0_0_6px_rgba(212,168,67,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
