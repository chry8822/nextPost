// src/app/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { formatDate } from '@/lib/utils';
import { Search, Heart, MessageCircle, PlusCircle, Ghost } from 'lucide-react';
import LikeButton from '@/components/posts/like-button';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { useSession } from 'next-auth/react';
import { useDialog } from '@/hooks/useDialog';
import ConfirmDialog from '@/components/layout/confirmDialog';
import { useRouter } from 'next/navigation';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { Post } from './types';
import { Tag } from '@/types/types';
import Posts from '@/components/posts/posts';
import { usePageLoading } from '@/hooks/useLoading';
import { LoadingScreen } from '@/components/ui/loading';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const { loading, withLoading } = usePageLoading('posts');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data: session, status } = useSession();
  const { openDialog } = useDialog();
  const router = useRouter();

  const animation = { duration: 50000, easing: (t: any) => t };
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'free-snap',
    slides: {
      perView: 'auto',
      spacing: 0,
    },
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

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '태그를 불러올 수 없습니다');
        }

        setTags(data.tags);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts(1, search);
  }, [search]);

  const fetchPosts = async (pageNum: number = 1, searchTerm: string = '', tag: string = '') => {
    return withLoading(async () => {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(tag && { tag: tag }),
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } else {
        throw new Error('포스트를 불러올 수 없습니다');
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent, tag: string = '') => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, search, tag);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, search);
  };

  if (loading) {
    return <LoadingScreen message="포스트를 불러오는 중..." showBrand={true} />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold  mb-6">모든 포스트</h1>

        <div className="flex  justify-between ">
          {/* 검색 바 */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Input type="text" placeholder="포스트 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Search className="h-4 w-4" />
            </button>
          </form>
          {!session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const result = await openDialog<boolean>(ConfirmDialog, {
                    message: '로그인이 필요합니다.',
                    confirmText: '로그인',
                    btnType: 'double',
                    position: 'center',
                  });

                  if (result) {
                    router.push('/auth/signin');
                  }
                } catch (e) {
                  console.log(e);
                }
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              글쓰기
            </Button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className=" text-lg">아직 포스트가 없습니다.</p>
          <p className=" mt-2">첫 번째 포스트를 작성해보세요!</p>
        </div>
      ) : (
        <>
          <div ref={sliderRef} className="keen-slider overflow-hidden!">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
            {tags.map((postTag, index) => (
              <div key={`${postTag.id}-${index}`} className={`keen-slider__slide number-slide${index + 1}`} style={{ width: 'auto', overflow: 'visible' }}>
                <Button className="mr-3 mb-3 cursor-pointer" variant="outline" onClick={(e) => handleSearchSubmit(e, postTag?.name)}>
                  # {postTag?.name}
                </Button>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            <Posts posts={posts} />
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} variant="outline">
                더 불러오기
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
