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

  // 컴포넌트 마운트 시 좋아요 상태 조회
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postSlug}/like`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error('좋아요 상태 조회 오류:', error);
      }
    };

    fetchLikeStatus();
  }, [postSlug, session]);

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
      console.log(result);
      if (result) {
        router.push('/auth/signin');
      }

      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '좋아요 처리에 실패했습니다');
      }

      const data = await response.json();
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
      className={`flex items-center space-x-2 ${liked ? '' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
    >
      <Heart className={`h-4 w-4 `} color={`${liked ? '#ff0000' : '#101828'}`} />
      <span>{likeCount}</span>
    </Button>
  );
}
