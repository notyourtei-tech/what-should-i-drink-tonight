'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || '注册失败');
          setLoading(false);
          return;
        }

        setSuccess('注册成功，正在登录...');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误');
        setSuccess('');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: 'demo@tonightdrink.ai',
        password: 'password123',
        redirect: false,
      });

      if (result?.error) {
        setError('Demo登录失败，请先运行 seed 脚本创建演示账户');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🥃</span>
            <span className="font-display text-2xl font-semibold gradient-text">
              Tonight Drink
            </span>
          </Link>
          <p className="text-white/40 mt-2">今晚喝什么？</p>
        </div>

        {/* Card */}
        <div className="bg-bar-900 border border-white/10 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-display font-semibold text-center mb-6">
            {mode === 'login' ? '欢迎回来' : '创建账户'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-white/40 mb-1">名字</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  className="input-dark"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-white/40 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-dark"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-dark"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full btn-gold flex items-center justify-center gap-2',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  处理中...
                </>
              ) : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl border border-gold-500/30 text-gold-400 font-medium hover:bg-gold-500/10 transition-all"
          >
            🎯 使用 Demo 账户体验
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              className="text-sm text-white/40 hover:text-gold-400 transition-colors"
            >
              {mode === 'login' ? '没有账号？立即注册' : '已有账号？去登录'}
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
