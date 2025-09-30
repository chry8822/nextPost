'use client';

/**
 * 📚 새로운 로딩 시스템 사용 예시 모음
 *
 * 기존 코드를 새로운 시스템으로 변경하는 방법을 보여줍니다.
 */

import { useState, useEffect } from 'react';
import { usePageLoading, useComponentLoading, useAsyncOperation } from '@/hooks/useLoading';
import { LoadingScreen, SkeletonList, InlineLoading } from '@/components/ui/loading';

// ✅ BEFORE: 기존 방식 (중복 코드)
function OldPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/posts');
        const data = await response.json();

        if (!response.ok) {
          throw new Error('데이터를 불러올 수 없습니다');
        }

        setPosts(data.posts);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
      }
    };

    fetchPosts();
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

  return <div>{/* 나머지 컴포넌트 */}</div>;
}

// 🎉 AFTER: 새로운 시스템 (간결한 코드)
function NewPostsPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const { loading, withLoading } = usePageLoading('posts');

  useEffect(() => {
    const fetchPosts = async () => {
      await withLoading(async () => {
        const response = await fetch('/api/posts');
        const data = await response.json();

        if (!response.ok) {
          throw new Error('데이터를 불러올 수 없습니다');
        }

        setPosts(data.posts);
      }).catch((error) => {
        setError(error.message);
      });
    };

    fetchPosts();
  }, [withLoading]);

  if (loading) {
    return <LoadingScreen message="포스트를 불러오는 중..." showBrand={true} />;
  }

  return <div>{/* 나머지 컴포넌트 */}</div>;
}

// 🧩 컴포넌트별 로딩 예시
function CommentSection() {
  const [comments, setComments] = useState([]);
  const { loading, startLoading, stopLoading } = useComponentLoading('comments');

  const submitComment = async (content: string) => {
    startLoading();

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      // 댓글 처리 로직
    } finally {
    }
  };

  return <div>{loading ? <InlineLoading text="댓글을 저장하는 중..." /> : <button onClick={() => submitComment('새 댓글')}>댓글 작성</button>}</div>;
}

// 🔄 비동기 작업 전용 훅 사용 예시
function AsyncOperationExample() {
  const { execute } = useAsyncOperation('asyncData');
  const [data, setData] = useState(null);

  const handleFetchData = async () => {
    const result = await execute(() => fetch('/api/data').then((res) => res.json()), '데이터를 불러올 수 없습니다');

    if (result) {
      setData(result);
    }
  };

  return <button onClick={handleFetchData}>데이터 가져오기</button>;
}

// 💀 스켈레톤 로더 사용 예시
function SkeletonExample() {
  const [loading, setLoading] = useState(true);

  return <div>{loading ? <SkeletonList count={5} /> : <div>{/* 실제 컨텐츠 */}</div>}</div>;
}

export { OldPostsPage, NewPostsPage, CommentSection, AsyncOperationExample, SkeletonExample };
