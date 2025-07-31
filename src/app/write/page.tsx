// src/app/write/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { Eye, Save, Send } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import ConfirmDialog from '@/components/layout/confirmDialog';
import { title } from 'process';

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { openDialog, closeDialog } = useDialog();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!editId) return;

    const fetchPostData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/edit/${editId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '포스트를 불러올 수 없습니다');
        }

        setFormData({
          title: data.post.title,
          content: data.post.content,
          tags: data.post.tags.join(', '),
        });
        setIsEditing(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : '포스트를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [editId]);

  // 로그인 체크
  if (status === 'loading') {
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

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (published: boolean) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '포스트 작성에 실패했습니다');
      }

      const result = await openDialog<boolean>(ConfirmDialog, {
        title: '완료',
        message: published ? '포스트가 발행되었습니다!' : '포스트가 임시저장되었습니다!',
        confirmText: '확인',
        position: 'center',
      });

      if (result) {
        router.push('/posts');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 마크다운을 HTML로 변환
  const renderPreview = (content: string) => {
    if (!content.trim()) return '<p style="color: #6b7280;">내용을 입력하세요...</p>';
    return renderMarkdownToHtml(content);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">포스트 작성</h1>
            <p className="text-gray-600">마크다운 문법을 지원합니다.</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>새 포스트</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? '편집' : '미리보기'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

              <div className="space-y-6">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="포스트 제목을 입력하세요"
                    disabled={loading}
                  />
                </div>

                {/* 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  {previewMode ? (
                    <div
                      className="min-h-[400px] w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: renderPreview(formData.content),
                      }}
                    />
                  ) : (
                    <Textarea
                      id="content"
                      name="content"
                      required
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="# 제목

## 소제목

여기에 내용을 작성하세요...

- 목록 아이템
- **굵은 글씨**
- *기울임 글씨*
- `코드`"
                      className="min-h-[400px] font-mono"
                      disabled={loading}
                    />
                  )}
                </div>

                {/* 태그 */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    태그
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="React, JavaScript, Web (쉼표로 구분)"
                    disabled={loading}
                  />
                </div>

                {/* 버튼들 */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? '저장 중...' : '임시저장'}
                  </Button>
                  <Button onClick={() => handleSubmit(true)} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? '발행 중...' : '발행하기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
