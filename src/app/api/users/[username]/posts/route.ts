// src/app/api/users/[username]/posts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const showAll = searchParams.get('all') === 'true'; // 모든 포스트 보기 (임시저장 포함)

  try {
    const session = await getServerSession(authOptions);

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 본인인지 확인
    const isOwner = session?.user?.id === user.id;

    const where = {
      authorId: user.id,
      // 본인이고 all=true인 경우 모든 포스트, 아니면 발행된 포스트만
      ...(isOwner && showAll ? {} : { published: true }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
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
          // 현재 사용자의 좋아요 상태 포함
          likes: session?.user
            ? {
                where: {
                  authorId: session.user.id,
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // 응답 데이터에 좋아요 상태 추가
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: session?.user ? post.likes.length > 0 : false,
      likes: undefined, // likes 배열은 제거 (보안상)
    }));

    return NextResponse.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('User posts fetch error:', error);
    return NextResponse.json({ error: '포스트를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
