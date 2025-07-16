'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* 히어로 섹션 */}
        <section className="text-center py-12 mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            개발자를 위한 <span className="text-blue-600">포스팅 플랫폼</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            기술 블로그를 작성하고, 다른 개발자들과 지식을 공유하며, 나만의 포트폴리오를 구축해보세요.
          </p>
          <div className="flex justify-center space-x-4">
            {status === 'loading' ? (
              <Button size="lg" disabled>
                로딩 중...
              </Button>
            ) : session ? (
              // 로그인된 사용자용 버튼
              <>
                <Button asChild size="lg">
                  <Link href="/write">포스트 작성하기</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/posts">포스트 둘러보기</Link>
                </Button>
              </>
            ) : (
              // 로그인되지 않은 사용자용 버튼
              <>
                <Button asChild size="lg">
                  <Link href="/auth/signup">시작하기</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/posts">포스트 둘러보기</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>마크다운 에디터</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">직관적인 마크다운 에디터로 쉽고 빠르게 기술 블로그를 작성할 수 있습니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏷️</span>
                <span>태그 시스템</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">태그를 통해 포스트를 분류하고, 관심 있는 주제의 글을 쉽게 찾을 수 있습니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>👥</span>
                <span>커뮤니티</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">댓글과 좋아요 기능으로 다른 개발자들과 소통하고 피드백을 받을 수 있습니다.</p>
            </CardContent>
          </Card>
        </section>

        {/* 최근 포스트 섹션 (나중에 실제 데이터로 교체) */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">최근 포스트</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 임시 포스트 카드들 */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">샘플 포스트 제목 {i}</CardTitle>
                  <p className="text-sm text-gray-500">
                    2024년 1월 {i}일 • 작성자{i}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">
                    이것은 샘플 포스트의 요약입니다. 실제 포스트가 작성되면 이 부분에 포스트의 일부 내용이 표시됩니다...
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">JavaScript</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/posts">모든 포스트 보기</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
