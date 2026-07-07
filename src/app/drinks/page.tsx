'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn, getStrengthColor, getDifficultyLabel, getDifficultyColor, getFlavorLabel, getDrinkEmoji } from '@/lib/utils';
import { CLASSIC_DRINKS, FLAVOR_TAGS, STRENGTH_LEVELS } from '@/lib/drinks-data';

// ── Categories for quick filter ──
const CATEGORY_TABS = [
  { id: '', label: '全部', emoji: '🍸' },
  { id: 'classic', label: '经典', emoji: '🥃' },
  { id: 'tiki', label: 'Tiki', emoji: '🏝️' },
  { id: 'japanese', label: '日式', emoji: '⛩️' },
  { id: 'korean', label: '韩式', emoji: '🇰🇷' },
  { id: 'chinese', label: '中式', emoji: '🇨🇳' },
  { id: 'modern', label: '现代', emoji: '✨' },
  { id: 'hot', label: '热饮', emoji: '☕' },
  { id: 'shot', label: 'Shot', emoji: '💥' },
  { id: 'mocktail', label: '无酒精', emoji: '🧊' },
];

function DrinksContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(
    searchParams.get('flavors')?.split(',').filter(Boolean) || []
  );
  const [selectedStrength, setSelectedStrength] = useState(searchParams.get('strength') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAICreate, setShowAICreate] = useState(false);
  const [aiIngredients, setAiIngredients] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFavoriteIds(new Set(data.map((f: any) => f.drinkId).filter(Boolean)));
      }).catch(() => {});
  }, []);

  const toggleFavorite = async (drinkId: string, drinkName: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const newFavs = new Set(favoriteIds);
    if (newFavs.has(drinkId)) { newFavs.delete(drinkId); } else { newFavs.add(drinkId); }
    setFavoriteIds(newFavs);
    try {
      await fetch('/api/favorites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drinkId, drinkName }),
      });
    } catch { setFavoriteIds(favoriteIds); }
  };

  const filteredDrinks = useMemo(() => CLASSIC_DRINKS.filter(d => {
    if (search && !d.name.includes(search) && !d.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedFlavors.length > 0 && !selectedFlavors.some(f => d.tags.includes(f))) return false;
    if (selectedStrength) {
      const lvl = STRENGTH_LEVELS.find(l => l.id === selectedStrength);
      if (lvl && d.abv && (d.abv < lvl.min || d.abv > lvl.max)) return false;
    }
    if (selectedCategory && d.category !== selectedCategory) return false;
    return true;
  }), [search, selectedFlavors, selectedStrength, selectedCategory]);

  const handleAICreate = async () => {
    if (!aiIngredients.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: aiIngredients.split(/[,，、\n]/).map((s: string) => s.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (error) { console.error(error); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-display font-bold mb-1">
          <span className="gradient-text">酒单</span>
        </h1>
        <p className="text-white/30 text-sm">探索 {CLASSIC_DRINKS.length} 款经典与创意鸡尾酒</p>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="搜索鸡尾酒名称..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-dark pl-12"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-medium',
              showFilters
                ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white hover:border-white/15'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            筛选
            {(selectedFlavors.length > 0 || selectedStrength) && (
              <span className="w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold flex items-center justify-center">
                {selectedFlavors.length + (selectedStrength ? 1 : 0)}
              </span>
            )}
          </button>
          <button onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-2 px-3 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.03]
                     text-white/50 hover:text-white hover:border-white/15 transition-all text-sm">
            {viewMode === 'grid' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            )}
          </button>
          <button onClick={() => setShowAICreate(true)} className="btn-gold text-sm px-4 gap-1.5">
            <span>🧪</span> AI 调酒
          </button>
        </div>
      </div>

      {/* ── Category Quick Tabs ── */}
      <div className="chip-scroll mb-4">
        {CATEGORY_TABS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(prev => prev === cat.id ? '' : cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all',
              selectedCategory === cat.id
                ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                : 'bg-white/[0.02] text-white/45 border-white/[0.06] hover:text-white/70 hover:border-white/15'
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="card-base p-5 mb-6 animate-slide-down">
          <div className="space-y-5">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">口味偏好</p>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_TAGS.map(flavor => (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavors(prev => prev.includes(flavor.id) ? prev.filter(f => f !== flavor.id) : [...prev, flavor.id])}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      selectedFlavors.includes(flavor.id)
                        ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                        : 'bg-white/[0.02] text-white/40 border-white/[0.06] hover:border-white/15'
                    )}
                  >{flavor.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">酒精度</p>
              <div className="flex flex-wrap gap-2">
                {STRENGTH_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedStrength(prev => prev === level.id ? '' : level.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      selectedStrength === level.id
                        ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                        : 'bg-white/[0.02] text-white/40 border-white/[0.06] hover:border-white/15'
                    )}
                  >{level.name} <span className="ml-1 opacity-50">{level.range}</span></button>
                ))}
              </div>
            </div>
            <button onClick={() => { setSelectedFlavors([]); setSelectedStrength(''); setSelectedCategory(''); }}
              className="text-xs text-white/30 hover:text-white transition-colors">
              清除所有筛选
            </button>
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/25">
          {filteredDrinks.length === CLASSIC_DRINKS.length
            ? `全部 ${CLASSIC_DRINKS.length} 款`
            : `筛选结果 ${filteredDrinks.length} 款`
          }
        </p>
        {filteredDrinks.length < CLASSIC_DRINKS.length && (
          <button onClick={() => { setSearch(''); setSelectedFlavors([]); setSelectedStrength(''); setSelectedCategory(''); }}
            className="text-xs text-gold-400/60 hover:text-gold-400">
            显示全部
          </button>
        )}
      </div>

      {/* ── Drinks Display ── */}
      {filteredDrinks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 stagger">
            {filteredDrinks.map(drink => (
              <Link key={drink.id} href={`/drinks/${drink.id}`} className="card-base card-hover group">
                <div className="relative h-36 sm:h-40 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10" />
                  <span className="text-5xl sm:text-6xl relative z-20 group-hover:scale-110 transition-transform duration-500">
                    {getDrinkEmoji(drink)}
                  </span>
                  <button onClick={e => toggleFavorite(drink.id, drink.name, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
                             bg-black/30 backdrop-blur-sm z-30 transition-all hover:bg-black/50">
                    <svg className={cn('w-4 h-4 transition-all', favoriteIds.has(drink.id) ? 'text-red-400 scale-110' : 'text-white/40 hover:text-white/70')}
                      fill={favoriteIds.has(drink.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <span className={cn('absolute top-2.5 left-2.5 z-30 text-[10px] px-2 py-0.5 rounded-full font-medium', getDifficultyColor(drink.difficulty))}>
                    {getDifficultyLabel(drink.difficulty)}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white group-hover:text-gold-400 transition-colors truncate">{drink.name}</h3>
                      <p className="text-[11px] text-white/20 truncate">{drink.nameEn}</p>
                    </div>
                    <span className={cn('text-xs font-bold flex-shrink-0', getStrengthColor(drink.abv || 0))}>{drink.abv}%</span>
                  </div>
                  <p className="text-[11px] text-white/25 line-clamp-2 mb-2.5">{drink.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {drink.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">{getFlavorLabel(tag)}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {filteredDrinks.map(drink => (
              <Link key={drink.id} href={`/drinks/${drink.id}`} className="card-base card-hover flex items-center gap-4 p-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-2xl flex-shrink-0
                              group-hover:scale-110 transition-transform duration-300">
                  {getDrinkEmoji(drink)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm text-white group-hover:text-gold-400 transition-colors">{drink.name}</h3>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', getDifficultyColor(drink.difficulty))}>
                      {getDifficultyLabel(drink.difficulty)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/25 truncate">{drink.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn('text-sm font-bold', getStrengthColor(drink.abv || 0))}>{drink.abv}%</span>
                  <button onClick={e => toggleFavorite(drink.id, drink.name, e)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all">
                    <svg className={cn('w-4 h-4', favoriteIds.has(drink.id) ? 'text-red-400' : 'text-white/25 hover:text-white/60')}
                      fill={favoriteIds.has(drink.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="empty-state">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-white/30 text-lg mb-2">没有找到匹配的鸡尾酒</p>
          <p className="text-white/20 text-sm mb-6">试试调整筛选条件或搜索关键词</p>
          <button onClick={() => { setSearch(''); setSelectedFlavors([]); setSelectedStrength(''); setSelectedCategory(''); }}
            className="btn-outline text-sm">清除所有筛选</button>
        </div>
      )}

      {/* ── AI Create Modal ── */}
      {showAICreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowAICreate(false); setAiResult(null); }} />
          <div className="relative w-full sm:max-w-lg bg-[#1a1a1a] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl
                        shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a1a] flex items-center justify-between px-6 py-4 border-b border-white/[0.05] rounded-t-3xl">
              <h3 className="text-lg font-semibold">
                <span className="gradient-text">🧪 AI 创意调酒</span>
              </h3>
              <button onClick={() => { setShowAICreate(false); setAiResult(null); }}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {!aiResult ? (
                <>
                  <p className="text-white/40 text-sm mb-4">输入你拥有的材料（用逗号分隔），AI 将为你创造独一无二的配方</p>
                  <textarea value={aiIngredients} onChange={e => setAiIngredients(e.target.value)}
                    placeholder="例如：威士忌、可乐、蜂蜜、柠檬"
                    className="input-dark h-32 resize-none mb-4" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['威士忌', '金酒', '伏特加', '朗姆酒', '龙舌兰', '可乐', '苏打水', '柠檬汁', '橙汁', '薄荷'].map(suggestion => (
                      <button key={suggestion}
                        onClick={() => setAiIngredients(prev => prev ? `${prev}、${suggestion}` : suggestion)}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-white/[0.04] text-white/35 border border-white/[0.06]
                                 hover:text-white/70 hover:border-white/15 transition-all">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleAICreate} disabled={!aiIngredients.trim() || aiLoading}
                    className={cn('w-full btn-gold gap-2', (!aiIngredients.trim() || aiLoading) && 'opacity-40 pointer-events-none')}>
                    {aiLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> AI 正在创作...</>
                    ) : '✨ 让 AI 创作'}
                  </button>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="text-center py-2">
                    <div className="text-5xl mb-3">🍸</div>
                    <h4 className="text-xl font-display font-bold gradient-text">{aiResult.name}</h4>
                    {aiResult.nameEn && <p className="text-sm text-white/25 mt-1">{aiResult.nameEn}</p>}
                  </div>
                  <p className="text-sm text-white/50 text-center leading-relaxed">{aiResult.description}</p>
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
                    <p className="text-xs text-white/25 uppercase tracking-wider mb-3">材料</p>
                    <div className="space-y-1.5">
                      {aiResult.ingredients?.map((ing: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white/60">{ing.name}</span>
                          <span className="text-white/25">{ing.amount}{ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
                    <p className="text-xs text-white/25 uppercase tracking-wider mb-3">制作步骤</p>
                    <ol className="space-y-2">
                      {aiResult.steps?.map((step: string, i: number) => (
                        <li key={i} className="text-sm text-white/55 flex gap-2.5">
                          <span className="text-gold-400 font-medium flex-shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {aiResult.reason && (
                    <p className="text-xs text-gold-400/50 text-center italic leading-relaxed px-4">
                      &ldquo;{aiResult.reason}&rdquo;
                    </p>
                  )}
                  <button onClick={() => { setAiResult(null); setAiIngredients(''); }}
                    className="w-full btn-outline text-sm">再来一杯</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrinksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      </div>
    }>
      <DrinksContent />
    </Suspense>
  );
}
