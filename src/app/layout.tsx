import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ThemeClient from './themeClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevSpace - 개발자 블로그 플랫폼',
  description: '개발자들을 위한 기술 블로그 및 포트폴리오 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeClient />
        <Providers>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
