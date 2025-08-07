// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { formatDate } from '@/lib/utils';
import { FileText, Eye, Heart, MessageCircle, PlusCircle, Edit, Trash2, BarChart3 } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalLikes: number;
  totalComments: number;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 로그인 체크
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '대시보드 정보를 불러올 수 없습니다');
        }

        setStats(data.stats);
        setRecentPosts(data.recentPosts);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [status, router]);

  console.log(stats);

  if (status === 'loading' || loading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              대시보드
            </h1>
            <p className="text-gray-600 mt-2">안녕하세요, {session?.user?.name || session?.user?.username}님!</p>
          </div>
          <Button asChild>
            <Link href="/write">
              <PlusCircle className="h-4 w-4 mr-2" />새 포스트 작성
            </Link>
          </Button>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">전체 포스트</p>
                  <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">발행됨</p>
                  <p className="text-2xl font-bold">{stats?.publishedPosts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">임시저장</p>
                  <p className="text-2xl font-bold">{stats?.draftPosts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">받은 좋아요</p>
                  <p className="text-2xl font-bold">{stats?.totalLikes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">받은 댓글</p>
                  <p className="text-2xl font-bold">{stats?.totalComments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 포스트 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-4">아직 작성한 포스트가 없습니다.</p>
                <Button asChild>
                  <Link href="/write">첫 포스트 작성하기</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link
                            href={post.published ? `/posts/${post.slug}` : `/write?edit=${post.id}`}
                            className="text-lg font-semibold hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {post.published ? '발행됨' : '임시저장'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>작성: {formatDate(post.createdAt)}</span>
                          <span>수정: {formatDate(post.updatedAt)}</span>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span>{post._count.likes}</span>
                            <MessageCircle className="h-4 w-4" />
                            <span>{post._count.comments}</span>
                          </div>
                        </div>

                        {/* 태그 */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map(({ tag }) => (
                              <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/write?edit=${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link href="/my-posts">모든 포스트 보기</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
