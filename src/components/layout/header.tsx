// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, PlusCircle, Home, FileText, Tag, Search } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import ThemeToggle from '../ui/themeToggle';
import { useEffect, useState } from 'react';
import { VerticalLine } from '../ui/lines';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 🚀 현대적 방식: CVA로 스타일 variants 정의
const headerStyles = cva('sticky top-0 z-50 w-full border-b border-slate-200 bg-white transition-all duration-300', {
  variants: {
    scrolled: {
      true: 'shadow-sm',
      false: '',
    },
  },
  defaultVariants: {
    scrolled: false,
  },
});

const headerLinkStyles = cva('py-2 px-2 rounded-md transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center');

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

  const navigationItems = [
    { href: '/posts', label: '포스트', icon: FileText },
    { href: '/tags', label: '태그', icon: Tag },
  ];

  return (
    <header className={headerStyles({ scrolled: isScrolled })}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600 transition-colors">DevSpace</span>
            </Link>

            {/* 네비게이션 메뉴 */}
            <nav className="flex items-center ">
              {navigationItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={headerLinkStyles()} title={label}>
                  <Icon className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-slate-500">로딩 중...</div>
            ) : session ? (
              // 로그인된 경우
              <div className="flex items-center space-x-3">
                <VerticalLine height={2} className="inline md:hidden" />

                <Button asChild variant="ghost" size="sm" className="m-0 px-1">
                  <Link href="/write">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    글쓰기
                  </Link>
                </Button>
                <VerticalLine height={2} />

                <Button asChild variant="ghost" size="sm" className="m-0 px-1">
                  <Link href="/dashboard">대시보드</Link>
                </Button>
                <VerticalLine height={2} />

                <Button asChild variant="ghost" size="sm" className="m-0 px-1">
                  <Link href="/my-posts">내 포스트</Link>
                </Button>
                <VerticalLine height={2} />

                <VerticalLine height={2} className="hidden lg:block" />

                <Button asChild variant="ghost" size="sm" className="m-0 px-1 hidden lg:inline-flex">
                  <Link href="/search">
                    <Search className="h-4 w-4 mr-2" />
                    통합검색
                  </Link>
                </Button>

                <VerticalLine height={2} className="hidden lg:block" />

                {/* <Button variant="ghost" size="sm" className="m-0 px-1" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2 " />
                  로그아웃
                </Button> */}

                <Button asChild variant="ghost" size="sm" className="m-0 px-1 hidden lg:inline-flex">
                  <Link href={`/profile/${session.user.username}`}>
                    <Avatar src={session.user.avatar} alt={`${session.user.name || session.user.username}의 프로필`} size="sm" className="mr-2" />
                    {session.user.name || session.user.username}
                  </Link>
                </Button>
              </div>
            ) : (
              // 로그인되지 않은 경우
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:text-blue-600 ">
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button asChild size="sm" className="transition-all duration-200 hover:scale-105 hover:shadow-md bg-blue-600 hover:bg-blue-700 ">
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
