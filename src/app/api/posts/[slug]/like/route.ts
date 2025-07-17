// src/app/api/posts/[slug]/like/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 좋아요 토글 (추가/제거)
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: { 
        slug: params.slug,
        published: true 
      },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 좋아요가 있는지 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_authorId: {
          postId: post.id,
          authorId: session.user.id
        }
      }
    })

    let liked = false
    let likeCount = 0

    if (existingLike) {
      // 좋아요 제거
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      liked = false
    } else {
      // 좋아요 추가
      await prisma.like.create({
        data: {
          postId: post.id,
          authorId: session.user.id
        }
      })
      liked = true
    }

    // 현재 좋아요 수 조회
    likeCount = await prisma.like.count({
      where: { postId: post.id }
    })

    return NextResponse.json({ 
      liked, 
      likeCount 
    })

  } catch (error) {
    console.error('Like toggle error:', error)
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 좋아요 상태 조회
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: { 
        slug: params.slug,
        published: true 
      },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 좋아요 수 조회
    const likeCount = await prisma.like.count({
      where: { postId: post.id }
    })

    // 현재 사용자의 좋아요 상태 확인
    let liked = false
    if (session?.user) {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_authorId: {
            postId: post.id,
            authorId: session.user.id
          }
        }
      })
      liked = !!existingLike
    }

    return NextResponse.json({ 
      liked, 
      likeCount 
    })

  } catch (error) {
    console.error('Like status fetch error:', error)
    return NextResponse.json(
      { error: '좋아요 상태를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}