'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export default function Avatar({ src, alt = '프로필 이미지', size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0', sizeClasses[size], className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={cn('text-blue-600', iconSizes[size])} />
      )}
    </div>
  );
}
