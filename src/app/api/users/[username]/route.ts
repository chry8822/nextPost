// src/app/api/users/[username]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        github: true,
        linkedin: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { published: true },
            },
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: '사용자 정보를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
