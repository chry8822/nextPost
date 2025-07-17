'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 초기 theme 값 동기화
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === 'dark' ? <span aria-hidden="true">🌙</span> : <span aria-hidden="true">☀️</span>}
      <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
    </Button>
  );
}
