'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Code, TrendingUp, Users, BookOpen, ChevronDown, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TechStackSlider } from '@/components/home/TechStackSlider';
import { Post } from '@/app/posts/types';
import Posts from '@/components/posts/posts';

export default function HomePage() {
  const { data: session, status } = useSession();

  // 📊 통계 카운터 애니메이션
  const [stats, setStats] = useState({ posts: 0, users: 0, views: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [realStats, setRealStats] = useState({ posts: 0, users: 0, views: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    const fetchPosts = async (pageNum: number = 1, searchTerm: string = '', tag: string = '') => {
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '10',
          ...(searchTerm && { search: searchTerm }),
          ...(tag && { tag: tag }),
        });

        const response = await fetch(`/api/posts?${params}`);
        const data = await response.json();

        if (response.ok) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('포스트 불러오기 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
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
              const newStats = Object.fromEntries(Object.entries(targets).map(([key, value]) => [key, Math.floor((value * step) / steps)])) as typeof stats;
              setStats(newStats);

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
        <div className="container mx-auto">
          <p className="text-center text-sm text-slate-500 mb-6">다양한 기술로 개발하는 개발자들이 모인 공간 🚀</p>

          {/* 🚀 Keen Slider로 구현한 무한 슬라이더 */}
          <TechStackSlider />
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
      <section className="grid md:grid-cols-3 gap-8 mb-12" ref={statsRef}>
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

      {posts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-slate-800 mb-8">최근 포스트</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Posts posts={posts} />
          </div>

          <div className="text-center mt-8 mb-8">
            <Button asChild variant="outline">
              <Link href="/posts">모든 포스트 보기</Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
