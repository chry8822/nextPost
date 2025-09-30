'use client';

import { useState, useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string;
  userId?: string;
  isOwner: boolean; // 본인 프로필인지 확인
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, userId, isOwner, onAvatarUpdate }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 이하)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);

    try {
      // FormData로 파일 전송
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '업로드에 실패했습니다.');
      }

      setAvatar(data.avatarUrl);
      onAvatarUpdate?.(data.avatarUrl);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert(error instanceof Error ? error.message : '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  console.log(avatar);

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center mx-auto">
        {avatar ? (
          <Image src={avatar} alt="프로필 이미지" width={96} height={96} className="w-full h-full object-cover" />
        ) : (
          <User className="h-12 w-12 text-blue-600" />
        )}
      </div>

      {isOwner && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />

          <Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? '업로드 중...' : avatar ? '이미지 변경' : '이미지 업로드'}
          </Button>
        </>
      )}
    </div>
  );
}
