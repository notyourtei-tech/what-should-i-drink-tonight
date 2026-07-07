import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Tonight Drink AI - 今晚喝什么',
  description: 'AI智能调酒推荐，帮你找到今晚最适合的鸡尾酒',
  keywords: '调酒,鸡尾酒,AI推荐,今晚喝什么,cocktail,bartender',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: '今晚喝什么' },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased overscroll-none">
        <Providers>
          <Navbar />
          <main className="pt-12 pb-20 md:pt-16 md:pb-0 safe-area-inset">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
