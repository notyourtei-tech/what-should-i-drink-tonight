'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn, getStrengthColor, getDifficultyLabel, getDifficultyColor, getGlassTypeLabel, getIceTypeLabel, getFlavorLabel, getFlavorColor, calculateABV, getDrinkEmoji, getCategoryLabel } from '@/lib/utils';
import { CLASSIC_DRINKS } from '@/lib/drinks-data';

export default function DrinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const drinkId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logRating, setLogRating] = useState(0);
  const [logNotes, setLogNotes] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [dbDrink, setDbDrink] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Try CLASSIC_DRINKS first, then fetch from API
  const staticDrink = CLASSIC_DRINKS.find(d => d.id === drinkId);
  const drink = staticDrink || dbDrink || CLASSIC_DRINKS[0];

  useEffect(() => {
    // If not found in static data, try fetching from API
    if (!staticDrink && drinkId) {
      setDbLoading(true);
      fetch(`/api/drinks/${drinkId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setDbDrink(data);
          }
        })
        .catch(() => {})
        .finally(() => setDbLoading(false));
    }
  }, [drinkId, staticDrink]);

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIsFavorite(data.some((f: any) => f.drinkId === drinkId));
        }
      })
      .catch(() => {});
  }, [drinkId]);

  const totalVolume = (drink.ingredients || []).reduce((sum, ing) => {
    if (ing.unit === 'ml') return sum + ing.amount;
    return sum;
  }, 0);

  const alcoholVolume = (drink.ingredients || [])
    .filter(ing => ing.type === 'alcohol')
    .reduce((sum, ing) => sum + (ing.unit === 'ml' ? ing.amount : 0), 0);

  const handleFavorite = async () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drinkId: drink.id,
          drinkName: drink.name,
          drinkData: drink,
        }),
      });
    } catch {
      setIsFavorite(!newState);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${drink.name} - Tonight Drink AI`,
        text: `来看看这款 ${drink.name} 鸡尾酒！`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Loading State */}
      {dbLoading && (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/40 mt-4">加载中...</p>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-card-gradient rounded-3xl border border-white/5 overflow-hidden mb-8">
        <div className="h-64 md:h-80 bg-gradient-to-br from-bar-800 via-bar-850 to-bar-900 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bar-900/80" />
          <span className="text-[120px] md:text-[160px] relative z-10 animate-float">
            {getDrinkEmoji(drink)}
          </span>
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleFavorite}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                isFavorite
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/10 text-white/60 hover:text-white'
              )}
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {(drink.tags || []).map((tag) => (
              <span key={tag} className={cn('text-xs px-3 py-1 rounded-full border', getFlavorColor(tag))}>
                {getFlavorLabel(tag)}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {drink.name}
          </h1>
          <p className="text-lg text-white/40 mb-4">{drink.nameEn}</p>
          {drink.category && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-3">
              {getCategoryLabel(drink.category)}
            </span>
          )}
          <p className="text-white/60">{drink.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-bar-800/50 rounded-xl">
              <p className={cn('text-2xl font-bold', getStrengthColor(drink.abv || 0))}>
                {drink.abv}%
              </p>
              <p className="text-xs text-white/40 mt-1">酒精度</p>
            </div>
            <div className="text-center p-4 bg-bar-800/50 rounded-xl">
              <p className="text-2xl font-bold text-white">
                {getDifficultyLabel(drink.difficulty)}
              </p>
              <p className="text-xs text-white/40 mt-1">难度</p>
            </div>
            <div className="text-center p-4 bg-bar-800/50 rounded-xl">
              <p className="text-2xl font-bold text-white">
                {getGlassTypeLabel(drink.glassType || 'highball')}
              </p>
              <p className="text-xs text-white/40 mt-1">推荐杯型</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-bar-850 rounded-2xl border border-white/5 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🧪</span> 材料
        </h2>
        <div className="space-y-3">
          {(drink.ingredients || []).map((ing, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                  ing.type === 'alcohol' ? 'bg-gold-500/10 text-gold-400' : 'bg-white/5 text-white/40'
                )}>
                  {ing.type === 'alcohol' ? '🥃' : ing.type === 'mixer' ? '🥤' : '🍋'}
                </div>
                <div>
                  <p className="font-medium text-white">{ing.name}</p>
                  <p className="text-xs text-white/30 capitalize">{ing.type === 'alcohol' ? '基酒' : ing.type === 'mixer' ? '调酒' : '装饰'}</p>
                </div>
              </div>
              <span className="text-gold-400 font-semibold">
                {ing.amount}{ing.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-bar-850 rounded-2xl border border-white/5 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📝</span> 制作步骤
        </h2>
        <ol className="space-y-4">
          {(drink.steps || []).map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-white/70 pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Glass & Ice */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bar-850 rounded-2xl border border-white/5 p-6 text-center">
          <div className="text-4xl mb-2">🥃</div>
          <p className="font-medium text-white">{getGlassTypeLabel(drink.glassType || 'highball')}</p>
          <p className="text-xs text-white/40 mt-1">推荐杯型</p>
        </div>
        <div className="bg-bar-850 rounded-2xl border border-white/5 p-6 text-center">
          <div className="text-4xl mb-2">🧊</div>
          <p className="font-medium text-white">{getIceTypeLabel(drink.iceType || 'cubes')}</p>
          <p className="text-xs text-white/40 mt-1">推荐冰块</p>
        </div>
      </div>

      {/* ABV Calculator */}
      <div className="bg-bar-850 rounded-2xl border border-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> 酒精度计算
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gold-400">{totalVolume}ml</p>
            <p className="text-xs text-white/40 mt-1">总体积</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gold-400">{alcoholVolume}ml</p>
            <p className="text-xs text-white/40 mt-1">纯酒精</p>
          </div>
          <div>
            <p className={cn('text-2xl font-bold', getStrengthColor(drink.abv || 0))}>
              {calculateABV(alcoholVolume, totalVolume)}%
            </p>
            <p className="text-xs text-white/40 mt-1">预计酒精度</p>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-medium animate-slide-up">
          链接已复制！
        </div>
      )}

      {/* Log Drink Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowLogModal(false); setLogSuccess(false); }} />
          <div className="relative w-full max-w-md bg-bar-900 border border-white/10 rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold">
                <span className="gradient-text">记录这杯酒</span>
              </h3>
              <button
                onClick={() => { setShowLogModal(false); setLogSuccess(false); }}
                className="text-white/40 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {!logSuccess ? (
                <>
                  <p className="text-white/50 text-sm mb-4">
                    记录你对 <span className="text-gold-400 font-medium">{drink.name}</span> 的评价
                  </p>

                  {/* Rating */}
                  <div className="mb-4">
                    <p className="text-sm text-white/40 mb-2">评分</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setLogRating(star)}
                          className="text-3xl transition-transform hover:scale-110"
                        >
                          <span className={star <= logRating ? 'text-gold-400' : 'text-white/20'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <p className="text-sm text-white/40 mb-2">备注（可选）</p>
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="记录你的感受..."
                      className="input-dark h-24 resize-none"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      setLogLoading(true);
                      try {
                        await fetch('/api/drinks/log', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            drinkName: drink.name,
                            rating: logRating || undefined,
                            notes: logNotes || undefined,
                          }),
                        });
                        setLogSuccess(true);
                      } catch (error) {
                        console.error(error);
                      } finally {
                        setLogLoading(false);
                      }
                    }}
                    disabled={logLoading}
                    className={cn(
                      'w-full btn-gold flex items-center justify-center gap-2',
                      logLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {logLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存记录'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✨</div>
                  <p className="text-lg font-semibold text-gold-400">已记录！</p>
                  <p className="text-sm text-white/40 mt-1">你的饮酒记录已保存</p>
                  <button
                    onClick={() => { setShowLogModal(false); setLogSuccess(false); setLogRating(0); setLogNotes(''); }}
                    className="mt-4 btn-outline text-sm"
                  >
                    关闭
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
