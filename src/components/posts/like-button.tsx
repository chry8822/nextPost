// src/components/posts/like-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import ConfirmDialog from '../layout/confirmDialog';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postSlug: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
}

export default function LikeButton({ postSlug, initialLiked = false, initialLikeCount = 0 }: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { openDialog } = useDialog();

  useEffect(() => {
    setLiked(initialLikeCount > 0);
  }, [initialLikeCount]);

  const handleLikeToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!session) {
      const result = await openDialog<boolean>(ConfirmDialog, {
        message: '로그인이 필요합니다.',
        confirmText: '로그인',
        btnType: 'double',
        position: 'center',
      });

      if (result) {
        router.push('/auth/signin');
      }

      return;
    }
    if (loading) return;

    // 낙관적 업데이트 (UI 먼저 변경)
    const previousLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        // 실패 시 이전 상태로 복원
        setLiked(previousLiked);
        setLikeCount(previousLikeCount);

        const data = await response.json();
        throw new Error(data.error || '좋아요 처리에 실패했습니다');
      }

      const data = await response.json();
      // 서버 응답으로 최종 상태 동기화
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
      alert('좋아요 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={loading}
      className={`flex items-center space-x-2 p-0 ${liked ? '' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
    >
      <Heart className={`h-4 w-4 `} color={`${liked ? '#ff0000' : '#101828'}`} />
      <span>{likeCount}</span>
    </Button>
  );
}
