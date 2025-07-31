// src/app/api/tags/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [tags, totalPosts] = await Promise.all([
      // 태그별 포스트 수 + 최신 포스트 정보 조회
      prisma.tag.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  post: {
                    published: true,
                  },
                },
              },
            },
          },
          // 각 태그의 가장 최신 포스트 날짜 가져오기
          posts: {
            select: {
              post: {
                select: {
                  createdAt: true,
                },
              },
            },
            where: {
              post: {
                published: true,
              },
            },
            orderBy: {
              post: {
                createdAt: 'desc',
              },
            },
            take: 1,
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
      }),

      // 전체 발행된 포스트 수 조회 (중복 제거)
      prisma.post.count({
        where: {
          published: true,
        },
      }),
    ]);

    // 포스트가 있는 태그만 필터링하고 최신 포스트 날짜 추가
    const tagsWithPosts = tags
      .filter((tag) => tag._count.posts > 0)
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        _count: tag._count,
        latestPostDate: tag.posts[0]?.post.createdAt || null,
      }));

    return NextResponse.json({
      tags: tagsWithPosts,
      totalPosts,
    });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json({ error: '태그를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
