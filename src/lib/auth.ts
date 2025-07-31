import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        } as User;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔵 signIn 콜백 호출:', {
        provider: account?.provider,
        email: user.email,
        name: user.name,
      });

      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            let username = user.email!.split('@')[0];

            // username 중복 확인
            const existingUsername = await prisma.user.findUnique({
              where: { username: username },
            });

            if (existingUsername) {
              username = `${username}_${Date.now()}`;
            }

            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                username: username,
                avatar: user.image || '',
                password: '',
              },
            });

            console.log('✅ 새 구글 사용자 생성:', newUser.id);
          } else {
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                avatar: user.image || existingUser.avatar,
              },
            });

            console.log('✅ 기존 구글 사용자 업데이트:', existingUser.id);
          }

          return true;
        } catch (error) {
          console.error('❌ 구글 사용자 처리 오류:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      console.log('🟡 JWT 콜백 호출:', {
        hasUser: !!user,
        hasToken: !!token,
        provider: account?.provider,
        email: user?.email || token.email,
      });

      // ✅ user가 있을 때만 실행 (로그인 시)
      if (user) {
        console.log('🔵 사용자 정보로 토큰 설정');

        if (account?.provider === 'google') {
          console.log('🔵 구글 로그인 JWT 처리');

          try {
            // DB에서 사용자 정보 조회
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });

            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.username = dbUser.username;
              token.avatar = dbUser.avatar;

              console.log('✅ 구글 JWT 설정 완료:', {
                id: token.id,
                email: token.email,
                username: token.username,
              });
            } else {
              console.error('❌ DB에서 구글 사용자 못찾음');
              // 기본값으로 설정
              token.id = user.id || 'google-temp-id';
              token.email = user.email;
              token.name = user.name;
              token.username = user.email?.split('@')[0] || 'temp-username';
              token.avatar = user.image || '';
            }
          } catch (error) {
            console.error('❌ 구글 JWT 처리 오류:', error);
            // 에러 시 기본값으로 설정
            token.id = user.id || 'google-error-id';
            token.email = user.email;
            token.name = user.name;
            token.username = user.email?.split('@')[0] || 'error-username';
            token.avatar = user.image || '';
          }
        } else {
          // 일반 로그인 (credentials)
          console.log('🔵 일반 로그인 JWT 처리');
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.username = (user as any).username;
          token.avatar = (user as any).avatar;
        }
      } else {
        // user가 없는 경우 (세션 확인 시)
        console.log('🔵 기존 토큰 유지 (세션 확인)');
        // 기존 토큰 정보 그대로 유지
      }

      console.log('🟡 JWT 콜백 완료, 최종 토큰:', {
        hasId: !!token.id,
        email: token.email,
        username: token.username,
      });

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = (token.id ?? '') as string;
        session.user.email = (token.email ?? '') as string; // 👈 추가 필요
        session.user.name = (token.name ?? '') as string; // 👈 추가 필요
        session.user.username = (token.username ?? '') as string;
        session.user.avatar = (token.avatar ?? '') as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
