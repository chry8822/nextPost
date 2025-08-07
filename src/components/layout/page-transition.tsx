'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname} // pathname이 변경될 때마다 새로운 컴포넌트로 인식
      className={cn(
        'min-h-screen',
        'animate-[fadeIn_0.3s_ease-out]' // 커스텀 키프레임 애니메이션
      )}
    >
      {children}
    </div>
  );
}
