// src/app/api/tags/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [tags, totalPosts] = await Promise.all([
      // 태그별 포스트 수 조회
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

    // 포스트가 있는 태그만 필터링
    const tagsWithPosts = tags.filter((tag) => tag._count.posts > 0);

    return NextResponse.json({
      tags: tagsWithPosts,
      totalPosts, // 실제 포스트 총 개수 추가
    });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json({ error: '태그를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
