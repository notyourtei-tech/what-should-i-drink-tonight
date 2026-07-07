'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { cn, getStrengthColor, getDifficultyLabel, getDifficultyColor, getFlavorLabel, getDrinkEmoji } from '@/lib/utils';
import { CLASSIC_DRINKS, TONIGHT_PICKS, FLAVOR_TAGS, STRENGTH_LEVELS } from '@/lib/drinks-data';

// ── Mood options for tonight pick ──
const MOODS = [
  { id: 'chill', label: '轻松', emoji: '😌', desc: '放松一下' },
  { id: 'party', label: '派对', emoji: '🎉', desc: '嗨起来' },
  { id: 'romantic', label: '浪漫', emoji: '💕', desc: '来杯温柔的' },
  { id: 'adventure', label: '冒险', emoji: '🔥', desc: '来点刺激的' },
  { id: 'fresh', label: '清爽', emoji: '🌿', desc: '清新解渴' },
  { id: 'warm', label: '温暖', emoji: '☕', desc: '暖暖的' },
];

export default function HomePage() {
  const [tonightPick, setTonightPick] = useState(TONIGHT_PICKS[0]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [heroVisible, setHeroVisible] = useState(false);
  const [pickAnimating, setPickAnimating] = useState(false);
  const pickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Init ──
  useEffect(() => {
    setHeroVisible(true);
    const randomPick = TONIGHT_PICKS[Math.floor(Math.random() * TONIGHT_PICKS.length)];
    setTonightPick(randomPick);

    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFavoriteIds(new Set(data.map((f: any) => f.drinkId).filter(Boolean)));
        }
      })
      .catch(() => {});
  }, []);

  // ── Tonight pick shuffle with animation ──
  const shufflePick = useCallback(() => {
    setPickAnimating(true);
    setTimeout(() => {
      const filtered = selectedMood
        ? TONIGHT_PICKS.filter(p => p.mood === MOODS.find(m => m.id === selectedMood)?.label)
        : TONIGHT_PICKS;
      const pool = filtered.length > 0 ? filtered : TONIGHT_PICKS;
      const newPick = pool[Math.floor(Math.random() * pool.length)];
      setTonightPick(newPick);
      setPickAnimating(false);
    }, 300);
  }, [selectedMood]);

  useEffect(() => {
    pickIntervalRef.current = setInterval(shufflePick, 6000);
    return () => { if (pickIntervalRef.current) clearInterval(pickIntervalRef.current); };
  }, [shufflePick]);

  const toggleFlavor = (id: string) => {
    setSelectedFlavors(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toggleFavorite = async (drinkId: string, drinkName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = new Set(favoriteIds);
    if (newFavs.has(drinkId)) { newFavs.delete(drinkId); } else { newFavs.add(drinkId); }
    setFavoriteIds(newFavs);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drinkId, drinkName }),
      });
    } catch { setFavoriteIds(favoriteIds); }
  };

  const displayedDrinks = CLASSIC_DRINKS.filter(d => {
    if (selectedFlavors.length > 0 && !selectedFlavors.some(f => d.tags.includes(f))) return false;
    if (selectedStrength) {
      const lvl = STRENGTH_LEVELS.find(l => l.id === selectedStrength);
      if (lvl && d.abv && (d.abv < lvl.min || d.abv > lvl.max)) return false;
    }
    return true;
  }).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden pt-4 pb-12 md:py-16">
        {/* Background orbs */}
        <div className="orb orb-gold w-[500px] h-[500px] -top-40 -right-40" />
        <div className="orb orb-purple w-[400px] h-[400px] top-20 -left-20" />
        <div className="orb orb-blue w-[300px] h-[300px] bottom-0 right-1/3" />

        <div className={cn(
          'relative max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-1000',
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gold-500/8 border border-gold-500/15 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500" />
              </span>
              <span className="text-sm font-medium text-gold-400/90 tracking-wide">AI 智能调酒助手</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold leading-none tracking-tight mb-6">
              <span className="gradient-text">今晚</span>
              <br />
              <span className="text-white">喝什么？</span>
            </h1>
            <p className="text-lg md:text-xl text-white/35 max-w-xl mx-auto leading-relaxed">
              告诉我你有什么酒，AI 帮你找到今晚最完美的那一杯
            </p>
          </div>

          {/* ═══ Tonight's Pick Card ═══ */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-gold-500/20 rounded-[2rem] blur-sm" />
              <div
                onClick={shufflePick}
                className={cn(
                  'relative bg-[#141414] border border-white/[0.08] rounded-[1.75rem] p-6 sm:p-8',
                  'cursor-pointer transition-all duration-300',
                  'hover:border-gold-500/20 hover:shadow-[0_0_40px_rgba(212,168,67,0.08)]',
                  pickAnimating && 'scale-95 opacity-50'
                )}
              >
                {/* Mood badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-xs font-semibold
                                border border-gold-500/15">
                    {tonightPick.mood}
                  </span>
                  <span className="text-white/20 text-xs">点击换一换</span>
                </div>

                {/* Drink display */}
                <div className="text-center space-y-3">
                  <div className="text-7xl animate-float">🍸</div>
                  <p className="text-white/25 text-xs uppercase tracking-widest">Tonight&apos;s Pick</p>
                  <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {tonightPick.text}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-6">
                  <Link
                    href={`/drinks/${tonightPick.drinkId}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-500 text-black
                             font-semibold text-sm hover:bg-gold-400 transition-all active:scale-95"
                  >
                    查看配方
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Mood Selector ═══ */}
          <div className="max-w-lg mx-auto mb-12">
            <p className="text-center text-white/25 text-xs uppercase tracking-widest mb-4">今晚的心情</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => { setSelectedMood(prev => prev === mood.id ? '' : mood.id); shufflePick(); }}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-200',
                    'border min-w-[72px]',
                    selectedMood === mood.id
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 scale-105 shadow-[0_0_20px_rgba(212,168,67,0.1)]'
                      : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white/70 hover:border-white/10'
                  )}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[11px] font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Quick Actions ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-16 stagger">
            {[
              { href: '/inventory', icon: '🥃', title: '管理库存', desc: '添加你的酒' },
              { href: '/drinks', icon: '🍸', title: '浏览酒单', desc: '60+ 经典配方' },
              { href: '/favorites', icon: '❤️', title: '我的收藏', desc: '常喝的配方' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="card-base card-hover card-press flex items-center gap-4 p-5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-gold-500/8 flex items-center justify-center text-2xl
                              group-hover:scale-110 group-hover:bg-gold-500/15 transition-all duration-300 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FILTER SECTION ═══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            找到你的<span className="gradient-text">完美风味</span>
          </h2>
          <p className="text-white/30 text-sm">选择口味和酒精度，筛选最适合你的配方</p>
        </div>

        {/* Flavor Tags */}
        <div className="mb-6">
          <p className="text-center text-white/25 text-xs uppercase tracking-widest mb-3">口味偏好</p>
          <div className="flex flex-wrap justify-center gap-2">
            {FLAVOR_TAGS.map(flavor => (
              <button
                key={flavor.id}
                onClick={() => toggleFlavor(flavor.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                  selectedFlavors.includes(flavor.id)
                    ? 'bg-gold-500/15 text-gold-400 border-gold-500/30 shadow-[0_0_12px_rgba(212,168,67,0.1)]'
                    : 'bg-white/[0.02] text-white/45 border-white/[0.06] hover:text-white/70 hover:border-white/15'
                )}
              >
                {flavor.name}
              </button>
            ))}
          </div>
        </div>

        {/* Strength Levels */}
        <div className="mb-8">
          <p className="text-center text-white/25 text-xs uppercase tracking-widest mb-3">酒精度</p>
          <div className="flex flex-wrap justify-center gap-2">
            {STRENGTH_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setSelectedStrength(prev => prev === level.id ? '' : level.id)}
                className={cn(
                  'px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200',
                  selectedStrength === level.id
                    ? 'bg-gold-500/15 text-gold-400 border-gold-500/30 shadow-[0_0_12px_rgba(212,168,67,0.1)]'
                    : 'bg-white/[0.02] text-white/45 border-white/[0.06] hover:text-white/70 hover:border-white/15'
                )}
              >
                <span>{level.name}</span>
                <span className="ml-1.5 text-[11px] opacity-50">{level.range}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        {(selectedFlavors.length > 0 || selectedStrength) && (
          <div className="text-center animate-fade-in">
            <Link
              href={`/drinks?flavors=${selectedFlavors.join(',')}&strength=${selectedStrength}`}
              className="btn-gold"
            >
              <span className="mr-2">✨</span>
              查看匹配的 {displayedDrinks.length} 款鸡尾酒
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* ═══════════════════ CLASSIC DRINKS ═══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              经典<span className="gradient-text">酒单</span>
            </h2>
            <p className="text-white/25 text-sm mt-1">永不过时的配方</p>
          </div>
          <Link href="/drinks" className="text-gold-400/70 text-sm hover:text-gold-400 transition-colors flex items-center gap-1">
            查看全部
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 stagger">
          {displayedDrinks.map(drink => (
            <Link
              key={drink.id}
              href={`/drinks/${drink.id}`}
              className="card-base card-hover group"
            >
              {/* Image area */}
              <div className="relative h-36 sm:h-40 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10" />
                <span className="text-5xl sm:text-6xl relative z-20 group-hover:scale-110 transition-transform duration-500">
                  {getDrinkEmoji(drink)}
                </span>
                {/* Favorite button */}
                <button
                  onClick={e => toggleFavorite(drink.id, drink.name, e)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
                           bg-black/30 backdrop-blur-sm z-30 transition-all hover:bg-black/50"
                >
                  <svg
                    className={cn(
                      'w-4 h-4 transition-all',
                      favoriteIds.has(drink.id) ? 'text-red-400 scale-110' : 'text-white/40 hover:text-white/70'
                    )}
                    fill={favoriteIds.has(drink.id) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                {/* Difficulty badge */}
                <span className={cn(
                  'absolute top-2.5 left-2.5 z-30 text-[10px] px-2 py-0.5 rounded-full font-medium',
                  getDifficultyColor(drink.difficulty)
                )}>
                  {getDifficultyLabel(drink.difficulty)}
                </span>
              </div>
              {/* Info */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-sm text-white group-hover:text-gold-400 transition-colors line-clamp-1">
                    {drink.name}
                  </h3>
                  <span className={cn('text-xs font-bold flex-shrink-0', getStrengthColor(drink.abv || 0))}>
                    {drink.abv}%
                  </span>
                </div>
                <p className="text-[11px] text-white/25 line-clamp-2 leading-relaxed mb-2.5">
                  {drink.description}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {drink.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">
                      {getFlavorLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════ AI CTA ═══════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gold-500/5 via-[#141414] to-purple-500/5
                      border border-white/[0.06] p-8 sm:p-12 text-center">
          <div className="orb orb-gold w-72 h-72 -top-20 -right-20" />
          <div className="orb orb-purple w-56 h-56 -bottom-20 -left-20" />

          <div className="relative space-y-5">
            <span className="inline-flex text-5xl animate-float">🧪</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              <span className="gradient-text">AI 创意调酒</span>
            </h2>
            <p className="text-white/35 text-base sm:text-lg max-w-md mx-auto">
              输入你手头的材料，让 AI 为你创造独一无二的专属鸡尾酒
            </p>
            <Link
              href="/drinks"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-base mt-4"
            >
              开始创作
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-white/[0.04] py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/15">
              <span>🥃</span>
              <span className="text-sm font-medium">Tonight Drink AI</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <span>© {new Date().getFullYear()}</span>
              <span>请适量饮酒</span>
              <span>未满18岁禁止饮酒</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
