// src/app/api/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'all' // all, posts, users, tags
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      error: '검색어는 2자 이상이어야 합니다'
    }, { status: 400 })
  }

  try {
    const session = await getServerSession(authOptions)
    const searchTerm = query.toLowerCase().trim()

    const results: any = {
      query: query,
      posts: [],
      users: [],
      tags: [],
      total: 0
    }

    // 포스트 검색
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ]
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          },
          // 현재 사용자의 좋아요 상태 포함
          likes: session?.user ? {
            where: {
              authorId: session.user.id
            },
            select: {
              id: true
            }
          } : false
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      results.posts = posts.map(post => ({
        ...post,
        isLiked: session?.user ? post.likes.length > 0 : false,
        likes: undefined,
        type: 'post'
      }))
    }

    // 사용자 검색
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { username: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
          ]
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              posts: {
                where: { published: true }
              }
            }
          }
        },
        take: limit
      })

      results.users = users.map(user => ({
        ...user,
        type: 'user'
      }))
    }

    // 태그 검색
    if (type === 'all' || type === 'tags') {
      const tags = await prisma.tag.findMany({
        where: {
          name: { contains: searchTerm }
        },
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  post: { published: true }
                }
              }
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        take: limit
      })

      results.tags = tags
        .filter(tag => tag._count.posts > 0)
        .map(tag => ({
          ...tag,
          type: 'tag'
        }))
    }

    results.total = results.posts.length + results.users.length + results.tags.length

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}