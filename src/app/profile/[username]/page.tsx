// src/app/profile/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import LikeButton from '@/components/posts/like-button';
import { formatDate } from '@/lib/utils';
import { User, Calendar, Globe, Github, Linkedin, FileText, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Post } from '@/app/posts/types';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
    likes: number;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 사용자 정보 조회
        const userResponse = await fetch(`/api/users/${params.username}`);
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.error || '사용자를 찾을 수 없습니다');
        }

        setUser(userData.user);

        // 사용자 포스트 조회
        const postsResponse = await fetch(`/api/users/${params.username}/posts`);
        const postsData = await postsResponse.json();

        if (postsResponse.ok) {
          setPosts(postsData.posts);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchUserData();
    }
  }, [params.username]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-slate-500 dark:text-slate-400">로딩 중...</div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{error || '사용자를 찾을 수 없습니다'}</h1>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 뒤로 가기 버튼 */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                홈으로
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 사용자 정보 카드 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name || user.username}</h1>
          <p className="text-slate-500 dark:text-slate-400">@{user.username}</p>
                  </div>

                  {user.bio && (
                    <div className="mb-6">
                      <p className="text-slate-700 dark:text-slate-300 text-center">{user.bio}</p>
                    </div>
                  )}

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{user._count.posts}</div>
                      <div className="text-sm text-gray-500">포스트</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{user._count.likes}</div>
                      <div className="text-sm text-gray-500">좋아요</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{user._count.comments}</div>
                      <div className="text-sm text-gray-500">댓글</div>
                    </div>
                  </div>

                  {/* 소셜 링크 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(user.createdAt)}에 가입</span>
                    </div>

                    {user.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}

                    {user.github && (
                      <div className="flex items-center">
                        <Github className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={`https://github.com/${user.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                          github.com/{user.github}
                        </a>
                      </div>
                    )}

                    {user.linkedin && (
                      <div className="flex items-center">
                        <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={`https://linkedin.com/in/${user.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                          linkedin.com/in/{user.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 포스트 목록 */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  포스트 ({user._count.posts})
                </h2>
              </div>

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>아직 작성한 포스트가 없습니다.</p>
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
                        <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

                        {/* 태그 */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map(({ tag }) => (
                              <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 통계 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <LikeButton initialLiked={post.isLiked} postSlug={post.slug} initialLikeCount={post._count.likes} />
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post._count.comments}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
