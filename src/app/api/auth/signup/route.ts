import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  username: z.string().min(3, '사용자명은 3자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, name, password } = signupSchema.parse(body);

    // 이미 존재하는 이메일 또는 사용자명 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: '이미 사용 중인 이메일 또는 사용자명입니다' }, { status: 400 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: '회원가입이 완료되었습니다',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Signup error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
