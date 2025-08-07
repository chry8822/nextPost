import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 🚀 병렬로 모든 통계 데이터 가져오기
    const [
      totalPosts,
      totalUsers,
      totalLikes,
      totalComments,
      recentPosts
    ] = await Promise.all([
      // 📝 발행된 포스트 수
      prisma.post.count({
        where: {
          published: true
        }
      }),
      
      // 👥 총 사용자 수  
      prisma.user.count(),
      
      // ❤️ 총 좋아요 수
      prisma.like.count(),
      
      // 💬 총 댓글 수
      prisma.comment.count(),
      
      // 📅 최근 7일간 생성된 포스트 수
      prisma.post.count({
        where: {
          published: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7일 전
          }
        }
      })
    ]);

    // 📊 조회수는 좋아요 수 * 8 정도로 추정 (실제 조회수 필드가 없으므로)
    const estimatedViews = totalLikes * 8 + totalComments * 3;

    return NextResponse.json({
      success: true,
      data: {
        posts: totalPosts,
        users: totalUsers,
        views: estimatedViews,
        likes: totalLikes,
        comments: totalComments,
        recentPosts,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stats API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        data: {
          // 📈 Fallback 기본값
          posts: 127,
          users: 89,
          views: 1560,
          likes: 195,
          comments: 89,
          recentPosts: 12,
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// 📝 POST 요청으로 통계 갱신 (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 🔒 여기에 관리자 권한 체크 로직 추가 가능
    
    // 📊 모든 통계 다시 계산
    const stats = await GET(request);
    
    return NextResponse.json({
      success: true,
      message: 'Statistics refreshed successfully',
      data: await stats.json()
    });
    
  } catch (error) {
    console.error('Stats refresh error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to refresh statistics' },
      { status: 500 }
    );
  }
}