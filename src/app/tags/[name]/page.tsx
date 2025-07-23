// src/app/tags/[name]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import LikeButton from '@/components/posts/like-button';
import { formatDate } from '@/lib/utils';
import { Hash, ArrowLeft, Heart, MessageCircle } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  createdAt: string;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
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

export default function TagDetailPage() {
  const params = useParams();
  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTagPosts = async () => {
      try {
        const tagName = decodeURIComponent(params.name as string);
        const response = await fetch(`/api/tags/${encodeURIComponent(tagName)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '태그 정보를 불러올 수 없습니다');
        }

        setTag(data.tag);
        setPosts(data.posts);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (params.name) {
      fetchTagPosts();
    }
  }, [params.name]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !tag) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '태그를 찾을 수 없습니다'}</h1>
            <Button asChild variant="outline">
              <Link href="/tags">
                <ArrowLeft className="h-4 w-4 mr-2" />
                태그 목록으로 돌아가기
              </Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로 가기 버튼 */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/tags">
                <ArrowLeft className="h-4 w-4 mr-2" />
                태그 목록으로
              </Link>
            </Button>
          </div>

          {/* 태그 정보 */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Hash className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
                    <p className="text-gray-600 mt-1">{posts.length}개의 포스트</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-medium">
                  <Hash className="h-4 w-4 inline mr-1" />
                  {tag.name}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 포스트 목록 */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Hash className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">이 태그로 작성된 포스트가 없습니다.</p>
                  <Button asChild>
                    <Link href="/write">첫 포스트를 작성해보세요</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Link href={`/profile/${post.author.username}`} className="hover:text-blue-600 transition-colors">
                          {post.author.name || post.author.username}
                        </Link>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(({ tag: postTag }) => (
                        <Link
                          key={postTag.id}
                          href={`/tags/${encodeURIComponent(postTag.name)}`}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            postTag.name === tag.name ? 'bg-blue-200 text-blue-900' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {postTag.name}
                        </Link>
                      ))}
                    </div>

                    {/* 통계 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <LikeButton postSlug={post.slug} initialLiked={post.isLiked} initialLikeCount={post._count.likes} />
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post._count.comments}</span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/posts/${post.slug}`}>자세히 보기</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
