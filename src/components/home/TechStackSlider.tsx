'use client';
import React, { memo } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { techStacks } from '@/constants/techStacks';
import { TechItem } from './TechItem';

export const TechStackSlider = memo(() => {
  const animation = { duration: 12000, easing: (t: any) => t };
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: 'performance',
    slides: {
      perView: 'auto',
      spacing: 50,
    },
    drag: false,
    initial: 0,
    created(s) {
      s.moveToIdx(5, true, animation);
    },
    updated(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
    animationEnded(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
  });

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        {/* 각 기술을 슬라이드로 만들기 - 무한 루프를 위해 2번 반복 */}
        {[...techStacks, ...techStacks].map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            className="keen-slider__slide flex items-center justify-center py-4"
            style={{ width: 'auto', overflow: 'visible' }}
          >
            <TechItem name={tech.name} icon={tech.icon} color={tech.color} url={tech.url} />
          </div>
        ))}
      </div>

      {/* 왼쪽 오른쪽 페이드 아웃 효과 */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
});

// displayName 설정으로 React DevTools에서 식별하기 쉽게
TechStackSlider.displayName = 'TechStackSlider';
