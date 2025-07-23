// src/app/my-posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import { formatDate } from '@/lib/utils';
import { FileText, Eye, EyeOff, Edit, Trash2, Filter } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import DeletePostDialog from '@/components/posts/delete-post-dialog';
import ConfirmDialog from '@/components/layout/confirmDialog';

interface MyPost {
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

export default function MyPostsPage() {
  const { openDialog, closeDialog } = useDialog();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    postId: string;
    postTitle: string;
  }>({
    show: false,
    postId: '',
    postTitle: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  // 로그인 체크
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const response = await fetch(`/api/users/${session?.user?.username}/posts?all=true`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '포스트를 불러올 수 없습니다');
        }

        setPosts(data.posts);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.username) {
      fetchMyPosts();
    }
  }, [status, router, session]);

  const filteredPosts = posts.filter((post) => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  const handleDeleteClick = async (postId: string, postTitle: string) => {
    setDeleteDialog({
      show: true,
      postId,
      postTitle,
    });

    const result = await openDialog<boolean>(ConfirmDialog, {
      children: (dialogId: string) => (
        <DeletePostDialog postTitle={deleteDialog.postTitle} onConfirm={handleDeleteConfirm} onCancel={() => closeDialog(dialogId)} loading={deleteLoading} />
      ),
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/posts/edit/${deleteDialog.postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '포스트 삭제에 실패했습니다');
      }

      // 포스트 목록에서 삭제된 포스트 제거
      setPosts((prev) => prev.filter((post) => post.id !== deleteDialog.postId));

      // 다이얼로그 닫기
      setDeleteDialog({ show: false, postId: '', postTitle: '' });

      alert('포스트가 삭제되었습니다.');
    } catch (error) {
      alert(error instanceof Error ? error.message : '포스트 삭제 중 오류가 발생했습니다');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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

  if (error) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
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
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3" />내 포스트 관리
            </h1>
            <Button asChild>
              <Link href="/write">새 포스트 작성</Link>
            </Button>
          </div>

          {/* 필터 */}
          <div className="flex space-x-2 mb-6">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
              전체 ({posts.length})
            </Button>
            <Button variant={filter === 'published' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('published')}>
              <Eye className="h-4 w-4 mr-1" />
              발행됨 ({posts.filter((p) => p.published).length})
            </Button>
            <Button variant={filter === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('draft')}>
              <EyeOff className="h-4 w-4 mr-1" />
              임시저장 ({posts.filter((p) => !p.published).length})
            </Button>
          </div>

          {/* 포스트 목록 */}
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">
                    {filter === 'published' && '발행된 포스트가 없습니다.'}
                    {filter === 'draft' && '임시저장된 포스트가 없습니다.'}
                    {filter === 'all' && '작성한 포스트가 없습니다.'}
                  </p>
                  <Button asChild>
                    <Link href="/write">첫 포스트 작성하기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {post.published ? '발행됨' : '임시저장'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>작성: {formatDate(post.createdAt)}</span>
                          <span>수정: {formatDate(post.updatedAt)}</span>
                          {post.published && (
                            <div className="flex items-center space-x-2">
                              <span>좋아요 {post._count.likes}</span>
                              <span>댓글 {post._count.comments}</span>
                            </div>
                          )}
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
                        {post.published && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/posts/${post.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/write?edit=${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClick(post.id, post.title)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
