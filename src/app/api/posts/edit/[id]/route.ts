// src/app/api/posts/edit/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePostSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  content: z.string().min(1, '내용은 필수입니다'),
  published: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다' }, { status: 404 });
    }

    // 작성자 본인만 편집 가능
    if (post.author.id !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 태그 이름들을 문자열로 변환
    const tagNames = post.tags.map(({ tag }) => tag.name);

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        tags: tagNames,
      },
    });
  } catch (error) {
    console.error('Post edit fetch error:', error);
    return NextResponse.json({ error: '포스트를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, published, tags } = updatePostSchema.parse(body);

    // 포스트 존재 확인 및 권한 체크
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true } },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다' }, { status: 404 });
    }

    if (existingPost.author.id !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 기존 태그 관계 삭제
    await prisma.postTag.deleteMany({
      where: { postId: params.id },
    });

    // 포스트 업데이트
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        content,
        published,
        excerpt: content.substring(0, 200) + '...',
        updatedAt: new Date(),
        tags: {
          create:
            tags?.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName.toLowerCase() },
                  create: { name: tagName.toLowerCase() },
                },
              },
            })) || [],
        },
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Post update error:', error);
    return NextResponse.json({ error: '포스트 수정 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 포스트 존재 확인 및 권한 체크
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true } },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다' }, { status: 404 });
    }

    if (existingPost.author.id !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 포스트 삭제 (Cascade로 관련 데이터들도 자동 삭제됨)
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: '포스트가 삭제되었습니다',
    });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json({ error: '포스트 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
}
