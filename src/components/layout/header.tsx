// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, PlusCircle, Home } from 'lucide-react';
import ThemeToggle from '../ui/themeToggle';
import { useEffect, useState } from 'react';

const HeaderLinkStyle = `py-2 px-3  rounded-md hover:bg-slate-100 hover:text-slate-900`;

export default function Header() {
  const { data: session, status } = useSession();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">DevSpace</span>
            </Link>

            {/* 네비게이션 메뉴 */}
            <nav className="hidden md:flex items-center ">
              <Link href="/" className={`flex items-center transition-colors ${HeaderLinkStyle}`}>
                <Home className="h-4 w-4 mr-2" />
                <span>홈</span>
              </Link>
              <Link href="/posts" className={`transition-colors ${HeaderLinkStyle}`}>
                포스트
              </Link>
              <Link href="/tags" className={`transition-colors ${HeaderLinkStyle}`}>
                태그
              </Link>
            </nav>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-500">로딩 중...</div>
            ) : session ? (
              // 로그인된 경우
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/write">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    글쓰기
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">대시보드</Link>
                </Button>

                <Button asChild variant="ghost" size="sm">
                  <Link href={`/profile/${session.user.username}`}>
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name || session.user.username}
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>

                {/* <ThemeToggle /> */}
              </div>
            ) : (
              // 로그인되지 않은 경우
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
