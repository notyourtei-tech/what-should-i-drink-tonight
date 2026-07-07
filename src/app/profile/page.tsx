'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [drinkLogCount, setDrinkLogCount] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/favorites').then(r => r.json()).catch(() => []),
        fetch('/api/inventory').then(r => r.json()).catch(() => []),
        fetch('/api/drinks/log').then(r => r.json()).catch(() => []),
      ]).then(([favs, inv, logs]) => {
        if (Array.isArray(favs)) setFavorites(favs);
        if (Array.isArray(inv)) setInventoryCount(inv.length);
        if (Array.isArray(logs)) setDrinkLogCount(logs.length);
      });
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isLoggedIn = !!session?.user;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-display font-bold mb-1">
          <span className="gradient-text">我的</span>
        </h1>
        <p className="text-white/30 text-sm">管理你的账户和偏好</p>
      </div>

      {isLoggedIn ? (
        <>
          {/* ── Profile Card ── */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#111]
                        border border-white/[0.06] p-6 sm:p-8 mb-6">
            <div className="orb orb-gold w-48 h-48 -top-10 -right-10 opacity-50" />
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gold-500/8 flex items-center justify-center
                            text-3xl sm:text-4xl flex-shrink-0 overflow-hidden border border-gold-500/10">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="" width={80} height={80} className="w-full h-full object-cover" />
                ) : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                  {session.user?.name || '调酒爱好者'}
                </h2>
                <p className="text-white/30 text-sm mt-0.5 truncate">{session.user?.email}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 rounded-xl border border-white/[0.06] text-white/40 text-xs
                         hover:text-white hover:border-white/15 transition-all flex-shrink-0">
                退出
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: drinkLogCount, label: '饮用记录', emoji: '📝' },
              { value: favorites.length, label: '收藏', emoji: '❤️' },
              { value: inventoryCount, label: '库存', emoji: '🥃' },
            ].map((stat, i) => (
              <div key={i} className="card-base p-4 sm:p-5 text-center">
                <span className="text-lg mb-1 block">{stat.emoji}</span>
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/25 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <div className="card-base overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <p className="text-sm font-semibold text-white">快捷操作</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { icon: '🥃', label: '管理库存', desc: `${inventoryCount} 件物品`, href: '/inventory' },
                { icon: '❤️', label: '我的收藏', desc: `${favorites.length} 款配方`, href: '/favorites' },
                { icon: '🍸', label: '浏览酒单', desc: '60+ 经典配方', href: '/drinks' },
                { icon: '🧪', label: 'AI 创意调酒', desc: '创造专属配方', href: '/drinks' },
              ].map((action, i) => (
                <button key={i} onClick={() => router.push(action.href)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{action.icon}</span>
                    <div className="text-left">
                      <p className="text-sm text-white/70">{action.label}</p>
                      <p className="text-[11px] text-white/25">{action.desc}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* ── Recent Favorites ── */}
          {favorites.length > 0 && (
            <div className="card-base p-5">
              <h3 className="text-sm font-semibold text-white mb-4">最近收藏</h3>
              <div className="space-y-2">
                {favorites.slice(0, 5).map(fav => (
                  <div key={fav.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🍸</span>
                      <p className="text-sm font-medium text-white/70">{fav.drinkName}</p>
                    </div>
                    <button onClick={() => router.push('/favorites')}
                      className="text-[10px] text-gold-400/60 hover:text-gold-400">查看</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Disclaimer ── */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-white/15">请适量饮酒 · 未满18岁禁止饮酒 · 酒后请勿驾车</p>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="w-20 h-20 rounded-full bg-gold-500/8 flex items-center justify-center text-4xl mb-5 animate-float">
            👤
          </div>
          <p className="text-white/30 text-lg mb-2">登录以保存你的数据</p>
          <p className="text-white/20 text-sm mb-6">收藏配方、管理库存、追踪饮用记录</p>
          <button onClick={() => router.push('/login')} className="btn-gold">
            登录 / 注册
          </button>
        </div>
      )}
    </div>
  );
}
