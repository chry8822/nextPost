'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Code, GitBranch, Zap, TrendingUp, Users, BookOpen, ChevronDown, Mouse } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
// 🎨 실제 기술 로고들 import
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiJavascript,
  SiPython,
  SiVuedotjs,
  SiAngular,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiAmazon,
  SiTailwindcss,
  SiPrisma,
  SiVercel,
  SiGithub,
} from 'react-icons/si';

// 🎨 실제 로고를 사용하는 기술 스택 아이템 컴포넌트
const TechItem = ({ name, icon: Icon, color }: { name: string; icon: React.ComponentType<any>; color: string }) => (
  <div className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 tech-item group cursor-default min-w-max">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 border border-slate-200">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-sm font-medium whitespace-nowrap">{name}</span>
  </div>
);

export default function HomePage() {
  const { data: session, status } = useSession();

  // 📊 통계 카운터 애니메이션
  const [stats, setStats] = useState({ posts: 0, users: 0, views: 0 });
  const [realStats, setRealStats] = useState({ posts: 0, users: 0, views: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // 🎯 스크롤 애니메이션 ref
  const statsRef = useRef(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  // 🌐 API에서 실제 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats');
        const result = await response.json();

        if (result.success) {
          setRealStats({
            posts: result.data.posts,
            users: result.data.users,
            views: result.data.views,
          });
        } else {
          // 📊 API 실패시 fallback 데이터
          setRealStats({ posts: 127, users: 89, views: 1560 });
        }
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
        // 📊 에러시 fallback 데이터
        setRealStats({ posts: 127, users: 89, views: 1560 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 스크롤 감지 및 통계 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && !isLoading) {
          setIsStatsVisible(true);

          // 통계 애니메이션 (한 번만 실행)
          const animateStats = () => {
            const targets = realStats; // 🎯 API에서 가져온 실제 데이터 사용
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;

            let step = 0;
            const timer = setInterval(() => {
              step++;
              setStats({
                posts: Math.floor((targets.posts * step) / steps),
                users: Math.floor((targets.users * step) / steps),
                views: Math.floor((targets.views * step) / steps),
              });

              if (step >= steps) {
                clearInterval(timer);
                setHasAnimated(true);
              }
            }, stepDuration);
          };

          setTimeout(animateStats, 300);
        }
      },
      { threshold: 1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, isLoading, realStats]);

  // 🚀 Keen Slider를 사용한 기술 스택 슬라이더
  const TechStackSlider = () => {
    const techStacks = [
      { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-600' },
      { name: 'React', icon: SiReact, color: 'text-cyan-500' },
      { name: 'Next.js', icon: SiNextdotjs, color: 'text-black' },
      { name: 'Vue.js', icon: SiVuedotjs, color: 'text-green-500' },
      { name: 'Angular', icon: SiAngular, color: 'text-red-600' },
      { name: 'JavaScript', icon: SiJavascript, color: 'text-yellow-500' },
      { name: 'Node.js', icon: SiNodedotjs, color: 'text-green-600' },
      { name: 'Python', icon: SiPython, color: 'text-blue-500' },
      { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-blue-700' },
      { name: 'MongoDB', icon: SiMongodb, color: 'text-green-700' },
      { name: 'Redis', icon: SiRedis, color: 'text-red-500' },
      { name: 'Docker', icon: SiDocker, color: 'text-blue-600' },
      { name: 'Kubernetes', icon: SiKubernetes, color: 'text-blue-700' },
      { name: 'Git', icon: SiGit, color: 'text-orange-600' },
      { name: 'GitHub', icon: SiGithub, color: 'text-black' },
      { name: 'Tailwind', icon: SiTailwindcss, color: 'text-cyan-400' },
      { name: 'Prisma', icon: SiPrisma, color: 'text-slate-700' },
      { name: 'GraphQL', icon: SiGraphql, color: 'text-pink-600' },
      { name: 'AWS', icon: SiAmazon, color: 'text-orange-500' },
      { name: 'Vercel', icon: SiVercel, color: 'text-black' },
    ];

    const animation = { duration: 10000, easing: (t: any) => t };
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
      loop: true,
      renderMode: 'performance',
      slides: {
        perView: 'auto',
        spacing: 50,
      },
      initial: 0,
      created(s) {
        if (!isPaused) {
          s.moveToIdx(5, true, animation);
        }
      },
      updated(s) {
        if (!isPaused) {
          s.moveToIdx(s.track.details.abs + 5, true, animation);
        }
      },
      animationEnded(s) {
        if (!isPaused) {
          s.moveToIdx(s.track.details.abs + 5, true, animation);
        }
      },
    });

    const handleMouseEnter = () => {
      setIsPaused(true);
      instanceRef.current?.animator.stop(); // 현재 애니메이션 중지
    };

    const handleMouseLeave = () => {
      setIsPaused(false);
      // 애니메이션 재개
      if (instanceRef.current) {
        const slider = instanceRef.current;
        slider.moveToIdx(slider.track.details.abs + 5, true, animation);
      }
    };

    return (
      <div>
        <div ref={sliderRef} className="keen-slider" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {/* 각 기술을 슬라이드로 만들기 - 무한 루프를 위해 2번 반복 */}
          {[...techStacks, ...techStacks].map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="keen-slider__slide flex items-center justify-center py-4"
              style={{ width: 'auto', overflow: 'visible' }}
            >
              <TechItem name={tech.name} icon={tech.icon} color={tech.color} />
            </div>
          ))}
        </div>

        {/* 왼쪽 오른쪽 페이드 아웃 효과 */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10"></div>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-5xl font-bold text-slate-800 mb-6 max-sm:text-3xl">
          개발자를 위한 <span className="text-blue-600 ">포스팅 플랫폼</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 mx-auto max-sm:text-base max-sm:px-4">
          기술 블로그를 작성하고, 다른 개발자들과 지식을 공유하며, 나만의 포트폴리오를 구축해보세요.
        </p>
        <div className="flex justify-center space-x-4">
          {status === 'loading' ? (
            <Button size="lg" disabled>
              로딩 중...
            </Button>
          ) : session ? (
            // 로그인된 사용자용 버튼
            <>
              <Button asChild size="lg">
                <Link href="/write">포스트 작성하기</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/posts">포스트 둘러보기</Link>
              </Button>
            </>
          ) : (
            // 로그인되지 않은 사용자용 버튼
            <>
              <Button asChild size="lg">
                <Link href="/auth/signup">시작하기</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/posts">포스트 둘러보기</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* 🚀 기술 스택 슬라이더 */}
      <section className="py-8 mb-12 overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-500 mb-6">다양한 기술로 개발하는 개발자들이 모인 공간 🚀</p>

          {/* 🚀 Keen Slider로 구현한 무한 슬라이더 */}
          <div className="relative">
            <TechStackSlider />
          </div>
        </div>
      </section>

      {/* 📊 실시간 통계 섹션 - 두 상태 모두 렌더링하여 부드러운 전환 */}
      <div className="relative">
        {/* 통계 섹션 */}
        <section
          className={`transition-all duration-700 ease-out transform ${
            isStatsVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl p-8 mb-12 border border-slate-100">
            <h3 className="text-center text-2xl font-bold text-slate-800 mb-8 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              DevSpace 실시간 현황
            </h3>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-1" />
                </div>
                <div className="text-3xl font-bold text-blue-600 tabular-nums">
                  {isLoading ? <div className="animate-pulse bg-blue-200 h-9 w-16 mx-auto rounded"></div> : `${stats.posts.toLocaleString()}+`}
                </div>
                <div className="text-sm text-slate-600">포스트</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-green-600 mr-1" />
                </div>
                <div className="text-3xl font-bold text-green-600 tabular-nums">
                  {isLoading ? <div className="animate-pulse bg-green-200 h-9 w-16 mx-auto rounded"></div> : `${stats.users.toLocaleString()}+`}
                </div>
                <div className="text-sm text-slate-600">개발자</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Code className="w-5 h-5 text-purple-600 mr-1" />
                </div>
                <div className="text-3xl font-bold text-purple-600 tabular-nums">
                  {isLoading ? <div className="animate-pulse bg-purple-200 h-9 w-20 mx-auto rounded"></div> : `${stats.views.toLocaleString()}+`}
                </div>
                <div className="text-sm text-slate-600">조회수</div>
              </div>
            </div>
          </div>
        </section>

        {/* 스크롤 유도 애니메이션 */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pb-16 text-center transition-all duration-700 ease-out transform ${
            !isStatsVisible ? 'opacity-100 translate-y-0 pointer-events-auto animate-bounce-slow' : 'opacity-0 -translate-y-10 pointer-events-none'
          }`}
        >
          {/* 텍스트 메시지 */}
          <div className="mb-8">
            <p className="text-sm text-slate-500">스크롤해서 DevSpace 실시간 통계를 확인해보세요</p>
          </div>

          {/* 캐스케이드 화살표 애니메이션 */}
          <div className="flex flex-col items-center space-y-1">
            <ChevronDown className="w-6 h-6 text-blue-500 animate-chevron-cascade" />
            <ChevronDown className="w-5 h-5 text-blue-400 animate-chevron-cascade-delay-1" />
            <ChevronDown className="w-4 h-4 text-blue-300 animate-chevron-cascade-delay-2" />
          </div>
        </div>
      </div>

      {/* 기능 소개 */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800">
              <span>📝</span>
              <span>마크다운 에디터</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">직관적인 마크다운 에디터로 쉽고 빠르게 기술 블로그를 작성할 수 있습니다.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏷️</span>
              <span>태그 시스템</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">태그를 통해 포스트를 분류하고, 관심 있는 주제의 글을 쉽게 찾을 수 있습니다.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800">
              <span>👥</span>
              <span>커뮤니티</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">댓글과 좋아요 기능으로 다른 개발자들과 소통하고 피드백을 받을 수 있습니다.</p>
          </CardContent>
        </Card>
      </section>

      {/* 최근 포스트 섹션 (나중에 실제 데이터로 교체) */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-8" ref={statsRef}>
          최근 포스트
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 임시 포스트 카드들 */}
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow bg-white
            hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 transition-all duration-300 transform-gpu
            "
            >
              <CardHeader>
                <CardTitle className="line-clamp-2 text-slate-800 font-semibold">샘플 포스트 제목 {i}</CardTitle>
                <p className="text-sm text-slate-500">
                  2024년 1월 {i}일 • 작성자{i}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 line-clamp-3">
                  이것은 샘플 포스트의 요약입니다. 실제 포스트가 작성되면 이 부분에 포스트의 일부 내용이 표시됩니다...
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">JavaScript</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 mb-8">
          <Button asChild variant="outline">
            <Link href="/posts">모든 포스트 보기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
