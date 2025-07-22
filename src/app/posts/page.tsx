// src/app/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
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
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('포스트 불러오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, search);
  }, [search]);

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
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
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
            <div ref={sliderRef} className="keen-slider">
              {posts
                .flatMap((post) => post.tags)
                .map((postTag, index) => (
                  <div
                    key={`${postTag.tag.id}-${index}`}
                    className={`keen-slider__slide number-slide${index + 1}`}
                    style={{ width: 'auto', overflow: 'visible' }}
                  >
                    <Button
                      className="mr-3 mb-3 cursor-pointer"
                      variant="outline"
                      key={`${postTag?.tag?.id}-${index}`}
                      onClick={(e) => handleSearchSubmit(e, postTag?.tag?.name)}
                    >
                      # {postTag?.tag?.name}
                    </Button>
                  </div>
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors flex flex-col h-full">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {formatDate(post.createdAt)} • {post.author.name || post.author.username}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pt-0">
                      <p className="text-gray-600 line-clamp-3 mb-4 " dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.excerpt) }} />
                      {/* 태그 */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map(({ tag }) => (
                            <span key={tag.id} className={`bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded bg-[${tag.color}]`}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 통계 */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          <LikeButton initialLiked={post.isLiked} postSlug={post.slug} initialLikeCount={post._count.likes} />
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="noneBox" className="p-0">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span>{post._count.comments}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
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
    </>
  );
}
