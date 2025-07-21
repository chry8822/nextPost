// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  content: z.string().min(1, '내용은 필수입니다'),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// 포스트 목록 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');

  try {
    // 검색어 전처리 (대소문자 구분 없는 검색을 위해)
    const searchTerm = search ? search.toLowerCase() : undefined;

    const where = {
      published: true,
      ...(tag && {
        tags: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      }),
      ...(searchTerm && {
        OR: [{ title: { contains: searchTerm } }, { content: { contains: searchTerm } }],
      }),
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json({ error: '포스트를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 포스트 생성
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, published, tags } = createPostSchema.parse(body);

    // 슬러그 생성 (제목을 기반으로)
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s가-힣-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // 슬러그 중복 확인 및 고유화
    let uniqueSlug = slug;
    let counter = 1;

    while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // 포스트 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        slug: uniqueSlug,
        published,
        authorId: session.user.id,
        tags: {
          create:
            tags?.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
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

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Post creation error:', error);
    return NextResponse.json({ error: '포스트 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
