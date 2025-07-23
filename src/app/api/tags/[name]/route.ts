// src/app/api/tags/[name]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const session = await getServerSession(authOptions);
    const tagName = decodeURIComponent(params.name);

    // 태그 존재 확인
    const tag = await prisma.tag.findUnique({
      where: { name: tagName },
      select: { id: true, name: true, color: true },
    });

    if (!tag) {
      return NextResponse.json({ error: '태그를 찾을 수 없습니다' }, { status: 404 });
    }

    const where = {
      published: true,
      tags: {
        some: {
          tagId: tag.id,
        },
      },
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
      tag,
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Tag posts fetch error:', error);
    return NextResponse.json({ error: '포스트를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
