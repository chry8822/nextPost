'use client';

import { useEffect } from 'react';

export default function ThemeClient() {
  useEffect(() => {
    // 라이트 모드로 강제 시작
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');

    console.log('✅ ThemeClient: 라이트 모드로 초기화 완료');
    console.log('HTML 클래스:', document.documentElement.className);
  }, []);

  return null;
}
