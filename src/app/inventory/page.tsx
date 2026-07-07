'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ALCOHOL_CATEGORIES, MIXER_CATEGORIES, FLAVOR_TAGS, STRENGTH_LEVELS } from '@/lib/drinks-data';
import Modal from '@/components/ui/Modal';

interface InventoryItem { id: string; category: string; name: string; brand?: string; quantity?: number; unit: string; }
interface AIRecommendation {
  name: string; nameEn: string; description: string;
  ingredients: { name: string; amount: number; unit: string; type: string }[];
  steps: string[]; tags: string[]; difficulty: string; abv: number; glassType: string; iceType: string; reason: string;
}

const CATEGORY_SEARCH_MAP: Record<string, string> = {};
ALCOHOL_CATEGORIES.forEach(c => { CATEGORY_SEARCH_MAP[c.name] = c.id; c.subtypes?.forEach(s => { CATEGORY_SEARCH_MAP[s] = c.id; }); });
MIXER_CATEGORIES.forEach(c => { CATEGORY_SEARCH_MAP[c.name] = c.id; });

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'alcohol' | 'mixer'>('alcohol');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'alcohol' | 'mixer'>('all');
  const [showAIRecommend, setShowAIRecommend] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/inventory').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setItems(data.map((item: any) => ({
        id: item.id, category: item.category, name: item.name,
        brand: item.brand, quantity: item.quantity, unit: item.unit,
      })));
    }).catch(() => {});
  }, []);

  const filteredItems = items.filter(item => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const alcoholItems = items.filter(i => i.category === 'alcohol');
  const mixerItems = items.filter(i => i.category === 'mixer');

  const handleAdd = async () => {
    const cat = addType === 'alcohol' ? ALCOHOL_CATEGORIES.find(c => c.id === selectedCategory) : MIXER_CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return;
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: addType, name: selectedSubtype || cat.name, brand: brand || undefined, quantity: quantity ? parseFloat(quantity) : undefined, unit: addType === 'alcohol' ? 'ml' : 'pcs' }),
      });
      const saved = await res.json();
      if (saved.id) setItems(prev => [...prev, { id: saved.id, category: saved.category, name: saved.name, brand: saved.brand, quantity: saved.quantity, unit: saved.unit }]);
    } catch {}
    setShowAddModal(false); setSelectedCategory(''); setSelectedSubtype(''); setBrand(''); setQuantity('');
  };

  const handleRemove = async (id: string) => {
    try { await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' }); } catch {}
    setItems(prev => prev.filter(item => item.id !== id));
    setDeleteConfirm(null);
  };

  const handleClearAll = async () => {
    try { await fetch('/api/inventory', { method: 'DELETE' }); } catch {}
    setItems([]);
  };

  const handleAIRecommend = async () => {
    setAiLoading(true);
    try {
      const alcohols = items.filter(i => i.category === 'alcohol').map(i => i.name);
      const mixers = items.filter(i => i.category === 'mixer').map(i => i.name);
      const res = await fetch('/api/ai/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alcohols, mixers, flavors: selectedFlavors, strength: selectedStrength || 'medium' }),
      });
      const data = await res.json();
      if (data.recommendations) setAiRecommendations(data.recommendations);
    } catch (error) { console.error(error); }
    finally { setAiLoading(false); }
  };

  const getCategoryIcon = (name: string) => {
    const cat = ALCOHOL_CATEGORIES.find(c => c.name === name || c.subtypes?.includes(name));
    return cat?.icon || '🥤';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-1">
            <span className="gradient-text">我的库存</span>
          </h1>
          <p className="text-white/30 text-sm">
            {items.length > 0
              ? `${items.length} 件物品 · ${alcoholItems.length} 酒 + ${mixerItems.length} 配料`
              : '还没有添加任何物品'}
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button onClick={handleClearAll}
              className="px-4 py-2.5 rounded-2xl border border-red-500/20 text-red-400/80 text-sm font-medium
                       hover:bg-red-500/8 hover:border-red-500/30 transition-all">
              清空全部
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="btn-gold text-sm gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            添加
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'all', label: '全部', count: items.length, emoji: '📦' },
          { id: 'alcohol', label: '酒类', count: alcoholItems.length, emoji: '🥃' },
          { id: 'mixer', label: '配料', count: mixerItems.length, emoji: '🥤' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all',
              activeTab === tab.id
                ? 'bg-gold-500/10 text-gold-400 border-gold-500/30'
                : 'bg-white/[0.02] text-white/45 border-white/[0.06] hover:text-white/70 hover:border-white/15'
            )}>
            <span>{tab.emoji}</span> {tab.label}
            <span className={cn('text-xs ml-1', activeTab === tab.id ? 'opacity-70' : 'opacity-40')}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="搜索库存..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} className="input-dark pl-12" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* ── Items ── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {filteredItems.map(item => (
            <div key={item.id} className="card-base flex items-center gap-3 p-4 group">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
                item.category === 'alcohol' ? 'bg-gold-500/8' : 'bg-white/[0.03]')}>
                {getCategoryIcon(item.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{item.name}</p>
                <p className="text-[11px] text-white/25 mt-0.5">
                  {item.brand ? `${item.brand} · ` : ''}
                  {item.quantity ? `${item.quantity}${item.unit}` : item.unit}
                </p>
              </div>
              <button onClick={() => setDeleteConfirm(item.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center
                         text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="text-6xl mb-5 animate-float">🥃</div>
          <p className="text-white/30 text-lg mb-2">库存空空如也</p>
          <p className="text-white/20 text-sm mb-6">添加你拥有的酒和配料，开始调酒之旅</p>
          <button onClick={() => setShowAddModal(true)} className="btn-gold">添加第一件物品</button>
        </div>
      )}

      {/* ── Delete Confirm Snackbar ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
             onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6 mx-4 max-w-sm w-full animate-scale-in"
               onClick={e => e.stopPropagation()}>
            <p className="text-white text-center mb-1 font-medium">确认删除</p>
            <p className="text-white/35 text-sm text-center mb-5">确定要从库存中移除此物品吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl border border-white/[0.06] text-white/50 text-sm hover:text-white transition-all">
                取消
              </button>
              <button onClick={() => handleRemove(deleteConfirm)}
                className="flex-1 py-3 rounded-2xl bg-red-500/15 text-red-400 text-sm font-medium border border-red-500/20
                         hover:bg-red-500/20 transition-all">
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Recommend FAB ── */}
      {items.length > 0 && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 animate-fade-in-up">
          <button onClick={() => setShowAIRecommend(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gold-500 text-black font-semibold
                     shadow-[0_8px_30px_rgba(212,168,67,0.3)] hover:bg-gold-400 active:scale-95 transition-all text-sm">
            <span className="text-lg">✨</span> AI 推荐
          </button>
        </div>
      )}

      {/* ── Add Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="添加库存">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => { setAddType('alcohol'); setSelectedCategory(''); setSelectedSubtype(''); }}
              className={cn('flex-1 py-3 rounded-2xl text-sm font-medium transition-all border',
                addType === 'alcohol' ? 'bg-gold-500/10 text-gold-400 border-gold-500/30' : 'bg-white/[0.03] text-white/45 border-white/[0.06]')}>
              🥃 酒类
            </button>
            <button onClick={() => { setAddType('mixer'); setSelectedCategory(''); setSelectedSubtype(''); }}
              className={cn('flex-1 py-3 rounded-2xl text-sm font-medium transition-all border',
                addType === 'mixer' ? 'bg-gold-500/10 text-gold-400 border-gold-500/30' : 'bg-white/[0.03] text-white/45 border-white/[0.06]')}>
              🥤 配料
            </button>
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">选择类别</p>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {(addType === 'alcohol' ? ALCOHOL_CATEGORIES : MIXER_CATEGORIES).map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubtype(''); }}
                  className={cn('flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all text-center',
                    selectedCategory === cat.id ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15')}>
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          {addType === 'alcohol' && selectedCategory && ALCOHOL_CATEGORIES.find(c => c.id === selectedCategory)?.subtypes && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">子类别</p>
              <div className="flex flex-wrap gap-2">
                {ALCOHOL_CATEGORIES.find(c => c.id === selectedCategory)!.subtypes!.map(sub => (
                  <button key={sub} onClick={() => setSelectedSubtype(sub)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      selectedSubtype === sub ? 'bg-gold-500/15 text-gold-400 border-gold-500/30' : 'bg-white/[0.02] text-white/40 border-white/[0.06]')}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">品牌（可选）</p>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="如：杰克丹尼" className="input-dark text-sm" />
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">数量</p>
              <div className="flex gap-2">
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder={addType === 'alcohol' ? 'ml' : '个'} className="input-dark text-sm flex-1" />
                <span className="flex items-center text-sm text-white/25">{addType === 'alcohol' ? 'ml' : '个'}</span>
              </div>
            </div>
          </div>
          <button onClick={handleAdd} disabled={!selectedCategory}
            className={cn('w-full btn-gold', !selectedCategory && 'opacity-40 pointer-events-none')}>
            添加到库存
          </button>
        </div>
      </Modal>

      {/* ── AI Recommend Modal ── */}
      <Modal isOpen={showAIRecommend} onClose={() => { setShowAIRecommend(false); setAiRecommendations([]); }}
        title="✨ AI 智能推荐" size="lg">
        <div className="space-y-5">
          {!aiRecommendations.length ? (
            <>
              <p className="text-white/35 text-sm">根据你的库存，AI 会为你推荐最适合的鸡尾酒</p>
              <div>
                <p className="text-xs text-white/25 uppercase tracking-wider mb-2.5">口味偏好（可选）</p>
                <div className="flex flex-wrap gap-2">
                  {FLAVOR_TAGS.slice(0, 12).map(flavor => (
                    <button key={flavor.id}
                      onClick={() => setSelectedFlavors(prev => prev.includes(flavor.id) ? prev.filter(f => f !== flavor.id) : [...prev, flavor.id])}
                      className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        selectedFlavors.includes(flavor.id) ? 'bg-gold-500/15 text-gold-400 border-gold-500/30' : 'bg-white/[0.02] text-white/40 border-white/[0.06]')}>
                      {flavor.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/25 uppercase tracking-wider mb-2.5">酒精度（可选）</p>
                <div className="flex flex-wrap gap-2">
                  {STRENGTH_LEVELS.map(level => (
                    <button key={level.id}
                      onClick={() => setSelectedStrength(prev => prev === level.id ? '' : level.id)}
                      className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        selectedStrength === level.id ? 'bg-gold-500/15 text-gold-400 border-gold-500/30' : 'bg-white/[0.02] text-white/40 border-white/[0.06]')}>
                      {level.name} <span className="ml-1 opacity-50">{level.range}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAIRecommend} disabled={aiLoading}
                className={cn('w-full btn-gold gap-2', aiLoading && 'opacity-40 pointer-events-none')}>
                {aiLoading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> AI 正在分析...</> : '✨ 获取推荐'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white/30 text-center">为你推荐 {aiRecommendations.length} 款鸡尾酒</p>
              {aiRecommendations.map((rec, i) => (
                <div key={i} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gold-400">{rec.name}</h4>
                      <p className="text-xs text-white/25">{rec.nameEn}</p>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                      rec.difficulty === 'easy' ? 'bg-green-500/15 text-green-400' :
                      rec.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400')}>
                      {rec.difficulty === 'easy' ? '简单' : rec.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                  <p className="text-sm text-white/45 mb-2">{rec.description}</p>
                  <p className="text-xs text-gold-400/50 italic mb-3">&ldquo;{rec.reason}&rdquo;</p>
                  <div className="bg-black/20 rounded-xl p-3 mb-3">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">材料</p>
                    <div className="space-y-1">
                      {rec.ingredients?.map((ing: any, j: number) => (
                        <div key={j} className="flex justify-between text-xs">
                          <span className="text-white/55">{ing.name}</span>
                          <span className="text-white/25">{ing.amount}{ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">步骤</p>
                    <ol className="space-y-1">
                      {rec.steps?.map((step: string, j: number) => (
                        <li key={j} className="text-xs text-white/45 flex gap-1.5">
                          <span className="text-gold-400 flex-shrink-0">{j + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
              <button onClick={() => { setAiRecommendations([]); setSelectedFlavors([]); setSelectedStrength(''); }}
                className="w-full btn-outline text-sm">再来一次</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
