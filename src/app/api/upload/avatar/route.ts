import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 선택되지 않았습니다.' }, { status: 400 });
    }

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일명 생성 (UUID + 확장자)
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;

    // uploads/avatars 폴더 생성
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    // 파일 저장
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 데이터베이스 업데이트
    const avatarUrl = `/uploads/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
