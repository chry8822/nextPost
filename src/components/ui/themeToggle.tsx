'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export default function ThemeToggle({ showLabel = false, size = 'sm' }: ThemeToggleProps) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 라이트 모드로 초기화
    setTheme('light');
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');

    console.log('✅ ThemeToggle: 라이트 모드로 초기화');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('테마 토글:', theme, '->', newTheme);

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // HTML 태그에 dark 클래스 추가/제거 (사용 안함)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('다크 모드 적용됨 - dark 클래스 추가');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('라이트 모드 적용됨 - dark 클래스 제거');
    }

    console.log('현재 HTML 클래스:', document.documentElement.className);
    console.log('data-theme:', document.documentElement.getAttribute('data-theme'));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size={size} className="w-9 h-9 p-0">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn(
        'relative transition-colors duration-200',
        'text-slate-900',
        'hover:bg-slate-100',
        'border border-slate-200',
        'bg-white',
        showLabel ? 'px-3' : 'w-9 h-9 p-0'
      )}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun Icon */}
        <Sun className={cn('h-4 w-4 transition-all duration-300 ease-in-out', isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')} />

        {/* Moon Icon */}
        <Moon
          className={cn('absolute h-4 w-4 transition-all duration-300 ease-in-out', isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0')}
        />
      </div>

      {/* Label (선택적) */}
      {showLabel && <span className="ml-2 text-sm font-medium">{isDark ? '라이트 모드' : '다크 모드'}</span>}
    </Button>
  );
}
