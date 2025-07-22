// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 사용자 통계 조회
    const [totalPosts, publishedPosts, draftPosts, totalLikes, totalComments, recentPosts] = await Promise.all([
      // 전체 포스트 수
      prisma.post.count({
        where: { authorId: session.user.id },
      }),

      // 발행된 포스트 수
      prisma.post.count({
        where: {
          authorId: session.user.id,
          published: true,
        },
      }),

      // 임시저장 포스트 수
      prisma.post.count({
        where: {
          authorId: session.user.id,
          published: false,
        },
      }),

      // 받은 좋아요 수
      prisma.like.count({
        where: {
          post: {
            authorId: session.user.id,
          },
        },
      }),

      // 받은 댓글 수
      prisma.comment.count({
        where: {
          post: {
            authorId: session.user.id,
          },
        },
      }),

      // 최근 포스트 5개
      prisma.post.findMany({
        where: { authorId: session.user.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalLikes,
        totalComments,
      },
      recentPosts,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: '대시보드 정보를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
