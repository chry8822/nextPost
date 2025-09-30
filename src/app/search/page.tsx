// src/app/search/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import LikeButton from '@/components/posts/like-button';
import { formatDate } from '@/lib/utils';
import { Search, FileText, User, Hash, ArrowRight, MessageCircle, Calendar } from 'lucide-react';
import Avatar from '@/components/ui/avatar';

interface SearchResult {
  [key: string]: any;
  query: string;
  posts: any[];
  users: any[];
  tags: any[];
  total: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as 'all' | 'posts' | 'users' | 'tags') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users' | 'tags'>('all');

  useEffect(() => {
    console.log(initialQuery);
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      handleSearch(initialQuery);
      setActiveTab(initialTab);
    }
  }, [initialQuery, initialTab]);

  const handleSearch = async (searchQuery: string = query, tab: string = activeTab) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setError('검색어는 2자 이상 입력해주세요');
      setResults(null);
      return;
    }

    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    params.set('p', searchQuery);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '검색 중 오류가 발생했습니다');
      }

      setResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleTabChange = (tab: 'all' | 'posts' | 'users' | 'tags') => {
    setActiveTab(tab);
  };

  console.log(results);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 검색 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-6">
            <Search className="h-8 w-8 mr-3 text-blue-600" />
            통합 검색
          </h1>

          {/* 검색 폼 */}
          <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="포스트, 사용자, 태그를 검색하세요..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? '검색 중...' : '검색'}
            </Button>
          </form>

          {/* 탭 */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: '전체', icon: Search },
              { key: 'posts', label: '포스트', icon: FileText },
              { key: 'users', label: '사용자', icon: User },
              { key: 'tags', label: '태그', icon: Hash },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
                {results && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {key === 'all' ? results.total : key === 'posts' ? results.posts.length : key === 'users' ? results.users.length : results.tags.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* 검색 결과 */}
        {results && !loading && (
          <div className="space-y-8">
            {/* 결과 요약 */}

            {results[activeTab]?.length > 0 || activeTab === 'all' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  "<strong>{results.query}</strong>"에 대한 검색 결과
                  <span className="font-bold"> {results.total}개</span>를 찾았습니다.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>검색 결과</strong>가 없습니다.
                </p>
              </div>
            )}

            {/* 포스트 결과 */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  포스트 ({results.posts.length})
                </h2>
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                            {post.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Link href={`/profile/${post.author.username}`} className="hover:text-blue-600 transition-colors">
                            {post.author.name || post.author.username}
                          </Link>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <LikeButton postSlug={post.slug} initialLiked={post.isLiked} initialLikeCount={post._count.likes} />
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post._count.comments}</span>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/posts/${post.slug}?from=search&q=${query}&tab=${activeTab}`}>
                              보러가기
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 사용자 결과 */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  사용자 ({results.users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <Card key={user.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <Avatar src={user.avatar} alt={`${user.name || user.username}의 프로필`} size="md" />
                          <div className="flex-1">
                            <Link
                              href={`/profile/${user.username}?from=search&q=${query}&tab=${activeTab}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {user.name || user.username}
                            </Link>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                            {user.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>}
                            <p className="text-xs text-gray-400 mt-2">{user._count.posts}개의 포스트</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 태그 결과 */}
            {(activeTab === 'all' || activeTab === 'tags') && results.tags.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  태그 ({results.tags.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.tags.map((tag) => (
                    <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <Link href={`/tags/${encodeURIComponent(tag.name)}?from=search&q=${query}&tab=${activeTab}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Hash className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="font-medium text-gray-900">{tag.name}</span>
                            </div>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">{tag._count.posts}개</span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 결과 없음 */}
            {results.total === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-slate-500 mb-4">다른 검색어를 시도해보세요.</p>
                <Button onClick={() => setQuery('')} variant="outline">
                  검색어 지우기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
