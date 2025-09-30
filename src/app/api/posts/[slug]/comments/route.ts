import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 1000자를 초과할 수 없습니다'),
});

// 댓글 생성
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = createCommentSchema.parse(body);

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
        published: true,
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다' }, { status: 404 });
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Comment creation error:', error);
    return NextResponse.json({ error: '댓글 작성 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 댓글 목록 조회
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
        published: true,
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다' }, { status: 404 });
    }

    // 댓글 목록 조회
    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json({ error: '댓글을 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}
