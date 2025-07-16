// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, PlusCircle, Home } from 'lucide-react';
import ThemeToggle from '../ui/themeToggle';

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">DevSpace</span>
            </Link>

            {/* 네비게이션 메뉴 */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1  hover:text-gray-900 transition-colors">
                <Home className="h-4 w-4" />
                <span>홈</span>
              </Link>
              <Link href="/posts" className=" hover:text-gray-900 transition-colors">
                포스트
              </Link>
              <Link href="/tags" className=" hover:text-gray-900 transition-colors">
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
                <Button asChild variant="outline" size="sm">
                  <Link href="/write">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    글쓰기
                  </Link>
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

                <ThemeToggle />
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
