// src/components/posts/comment-section.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { User, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
}

interface CommentSectionProps {
  postSlug: string;
  initialComments: Comment[];
  commentCount: number;
}

export default function CommentSection({ postSlug, initialComments, commentCount }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setError('로그인이 필요합니다');
      return;
    }

    if (!newComment.trim()) {
      setError('댓글 내용을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '댓글 작성에 실패했습니다');
      }

      // 새 댓글을 목록 맨 위에 추가
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>댓글 ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 댓글 작성 폼 */}
        {session ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="mb-3"
                  rows={3}
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? '작성 중...' : '댓글 작성'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center transition-colors">
            <p className="text-slate-600 dark:text-slate-300 mb-2">댓글을 작성하려면 로그인해주세요</p>
            <div className="space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/signin">로그인</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link
                        href={`/profile/${comment.author.username}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        {comment.author.name || comment.author.username}
                      </Link>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
