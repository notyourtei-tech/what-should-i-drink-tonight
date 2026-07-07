'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn, getStrengthColor, getDifficultyLabel, getDifficultyColor, getFlavorLabel, getDrinkEmoji } from '@/lib/utils';
import { CLASSIC_DRINKS } from '@/lib/drinks-data';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFavorites(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const favoriteDrinks = favorites.map(fav => {
    const classic = CLASSIC_DRINKS.find(d => d.id === fav.drinkId);
    if (classic) return { ...classic, favId: fav.id, isCustom: false };
    if (fav.drinkData) return { ...fav.drinkData, id: fav.drinkId || fav.id, favId: fav.id, isCustom: true };
    return { id: fav.drinkId || fav.id, name: fav.drinkName, nameEn: '', description: '自定义饮品',
      ingredients: [], steps: [], tags: [], difficulty: 'medium', abv: 0, glassType: 'highball', iceType: 'cubes', favId: fav.id, isCustom: true };
  }).filter(Boolean);

  const toggleFavorite = async (favId: string) => {
    setRemovingId(favId);
    const fav = favorites.find(f => f.id === favId);
    try {
      await fetch('/api/favorites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drinkId: fav?.drinkId, drinkName: fav?.drinkName }),
      });
      setFavorites(prev => prev.filter(f => f.id !== favId));
    } catch {}
    setRemovingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-display font-bold mb-1">
          <span className="gradient-text">我的收藏</span>
        </h1>
        <p className="text-white/30 text-sm">
          {favoriteDrinks.length > 0 ? `${favoriteDrinks.length} 款收藏的配方` : '保存你喜欢的配方'}
        </p>
      </div>

      {favoriteDrinks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 stagger">
          {favoriteDrinks.map((drink: any) => (
            <div key={drink.id}
              className={cn('card-base group relative', removingId === drink.favId && 'opacity-50 scale-95')}>
              <Link href={`/drinks/${drink.id}`}>
                <div className="relative h-36 sm:h-40 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10" />
                  <span className="text-5xl sm:text-6xl relative z-20 group-hover:scale-110 transition-transform duration-500">
                    {getDrinkEmoji(drink)}
                  </span>
                  {drink.isCustom && (
                    <span className="absolute top-2.5 left-2.5 z-30 text-[10px] px-2 py-0.5 rounded-full
                                   bg-purple-500/15 text-purple-400 font-medium">AI</span>
                  )}
                </div>
              </Link>
              <button onClick={() => toggleFavorite(drink.favId)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
                         bg-red-500/15 text-red-400 z-30 transition-all hover:bg-red-500/25 hover:scale-110">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <Link href={`/drinks/${drink.id}`}>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white group-hover:text-gold-400 transition-colors truncate">{drink.name}</h3>
                    </div>
                    <span className={cn('text-xs font-bold flex-shrink-0', getStrengthColor(drink.abv || 0))}>{drink.abv}%</span>
                  </div>
                  <p className="text-[11px] text-white/25 line-clamp-2 mb-2.5">{drink.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {drink.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">{getFlavorLabel(tag)}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="text-6xl mb-5 animate-float">❤️</div>
          <p className="text-white/30 text-lg mb-2">还没有收藏</p>
          <p className="text-white/20 text-sm mb-6">浏览酒单，收藏你喜欢的配方</p>
          <Link href="/drinks" className="btn-gold gap-2">
            浏览酒单
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}
