'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// 🎨 DevSpace 스타일의 로딩 스피너
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size], className)} />;
}

// 🌟 DevSpace 브랜드 로딩 애니메이션
export function DevSpaceLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('relative', containerSizes[size])}>
      {/* 회전하는 점들 */}
      <div className="absolute inset-0 animate-pulse animate-spin">
        <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 ', dotSizes[size])}></div>
        <div className={cn('absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-blue-500', dotSizes[size])}></div>
        <div className={cn('absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-blue-400', dotSizes[size])}></div>
        <div className={cn('absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-blue-300', dotSizes[size])}></div>
      </div>
    </div>
  );
}

// 📄 페이지 전체 로딩 화면
export function LoadingScreen({ message = '로딩 중...', showBrand = true, className }: { message?: string; showBrand?: boolean; className?: string }) {
  return (
    <main className={cn('container mx-auto px-4 py-8', className)}>
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
        {showBrand ? (
          <div className="flex flex-col items-center space-y-4">
            <DevSpaceLoader size="md" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-1 ">DevSpace</h3>
              <p className="text-slate-800 text-sm animate-pulse">{message}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-600">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}

// 🔧 인라인 로딩 (버튼, 폼 등에서 사용)
export function InlineLoading({ text = '처리 중...', size = 'sm' }: { text?: string; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span className="text-slate-600">{text}</span>
    </div>
  );
}

// 💀 스켈레톤 로더 컴포넌트들
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          <div className="h-6 bg-slate-200 rounded-full w-12"></div>
          <div className="h-6 bg-slate-200 rounded-full w-12"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// 📊 통계 카드 스켈레톤
export function SkeletonStatsCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-slate-200 p-6">
      <div className="text-center">
        <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div>
      </div>
    </div>
  );
}
