// src/app/tags/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Hash, FileText } from 'lucide-react';
import { Tag } from '@/types/types';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const maxTagPosts = useMemo(() => (tags.length > 0 ? Math.max(...tags.map((t) => t._count.posts)) : 0), [tags]);

  const getTagSizeClass = (postCount: number): string => {
    let ratio: number;
    ratio = maxTagPosts > 0 ? postCount / maxTagPosts : 0;

    // 🚀 색상 제거 - 크기와 폰트만 적용
    if (ratio >= 0.8) return 'text-2xl font-bold';
    if (ratio >= 0.6) return 'text-xl font-semibold';
    if (ratio >= 0.4) return 'text-lg font-medium';
    if (ratio >= 0.2) return 'text-base font-normal';
    return 'text-sm font-normal';
  };

  // 인기 태그 계산 (3단계 우선순위)
  // 1순위: 포스트 수가 많은 것
  // 2순위: 최신 포스트가 있는 것 (동일한 포스트 수일 때)
  // 3순위: 알파벳 순 (포스트 수와 최신 날짜가 모두 동일할 때)
  const mostPopularTag =
    tags.length > 0
      ? tags.reduce((prev, current) => {
          // 1순위: 포스트 수 비교
          if (current._count.posts !== prev._count.posts) {
            return current._count.posts > prev._count.posts ? current : prev;
          }

          // 2순위: 최신 포스트 날짜 비교
          const currentLatest = current.latestPostDate ? new Date(current.latestPostDate) : null;
          const prevLatest = prev.latestPostDate ? new Date(prev.latestPostDate) : null;

          // 둘 다 날짜가 있는 경우
          if (currentLatest && prevLatest) {
            if (currentLatest.getTime() !== prevLatest.getTime()) {
              return currentLatest > prevLatest ? current : prev;
            }
          }
          // 하나만 날짜가 있는 경우
          else if (currentLatest && !prevLatest) {
            return current;
          } else if (!currentLatest && prevLatest) {
            return prev;
          }

          // 3순위: 알파벳 순
          return current.name.toLowerCase() < prev.name.toLowerCase() ? current : prev;
        })
      : null;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '태그를 불러올 수 없습니다');
        }

        setTags(data.tags);
        setTotalPosts(data.totalPosts || 0);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center mb-4">
            <Hash className="h-8 w-8 mr-3 text-blue-600" />
            모든 태그
          </h1>
          <p className="text-slate-700">관심 있는 주제의 태그를 클릭해서 관련 포스트를 탐색해보세요.</p>
        </div>

        {tags.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-slate-500">
                <Hash className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="mb-4">아직 사용된 태그가 없습니다.</p>
                <Button asChild>
                  <Link href="/write">첫 포스트를 작성해보세요</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 태그 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Hash className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">전체 태그</p>
                      <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">총 포스트</p>
                      <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Hash className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">인기 태그</p>
                      <p className="text-2xl font-bold text-gray-900">{mostPopularTag?.name || '-'}</p>
                      {mostPopularTag && <p className="text-xs text-gray-400 dark:text-gray-500">{mostPopularTag._count.posts}개 포스트</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 태그 클라우드 */}
            <Card>
              <CardHeader>
                <CardTitle>태그 클라우드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 ">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`} className="block">
                      <span
                        className={`transition-transform duration-200 ease-out inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 hover:scale-200 hover:shadow-md ${getTagSizeClass(
                          tag._count.posts
                        )}`}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag.name}
                        <span className="ml-2 text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{tag._count.posts}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 태그 목록 */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">태그 목록</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <Link href={`/tags/${encodeURIComponent(tag.name)}`}>
                    <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Hash className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-900">{tag.name}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-700  px-2 py-1 rounded-full text-sm transition-colors">{tag._count.posts}개</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
