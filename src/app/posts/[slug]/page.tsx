// src/app/posts/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import CommentSection from '@/components/posts/comment-section';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, ArrowLeft, User } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import LikeButton from '@/components/posts/like-button';
import { BackButton } from '@/components/ui/backButton';

interface PostDetail {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '포스트를 불러올 수 없습니다');
        }

        setPost(data.post);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '포스트를 찾을 수 없습니다'}</h1>
          <Button asChild variant="outline">
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              포스트 목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로 가기 버튼 */}
        <div className="mb-6">
          <BackButton moveType="posts" />
        </div>

        {/* 포스트 메타 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar src={post.author.avatar} alt={`${post.author.name || post.author.username}의 프로필`} size="sm" />
                  <Link href={`/profile/${post.author.username}`} className="text-blue-600 hover:text-blue-500 font-medium">
                    {post.author.name || post.author.username}
                  </Link>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{formatDate(post.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <LikeButton initialLiked={post.isLiked} postSlug={post.slug} initialLikeCount={post._count.likes} />
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="noneBox" className="p-0">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{post._count.comments}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(({ tag }) => (
                  <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full transition-colors">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* 포스트 내용 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className="prose max-w-none prose-slate"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToHtml(post.content),
              }}
            />
          </CardContent>
        </Card>

        {/* 작성자 정보 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{post.author.name || post.author.username}</h3>
                <p className="text-sm text-gray-500 mb-2">@{post.author.username}</p>
                {post.author.bio && <p className="text-gray-600">{post.author.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <CommentSection postSlug={post.slug} initialComments={post.comments} commentCount={post._count.comments} />
      </div>
    </main>
  );
}
