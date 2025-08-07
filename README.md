---

# DevSpace

🏗️ 프로젝트 개요
**DevSpace**는 개발자를 위한 기술 블로그 및 포트폴리오 플랫폼입니다.  
마크다운 기반의 에디터, 태그 시스템, 커뮤니티 기능(댓글/좋아요) 등  
현대적인 개발자 커뮤니티에 필요한 모든 기능을 제공합니다.

<br/>

🚀 데모

> 준비중

<br/>

##  📁 프로젝트 구조 분석
1. 기술 스택
- **Frontend**:  
  - [Next.js 15 (App Router)](https://nextjs.org/)
  - [React 19](https://react.dev/)
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [Zustand](https://zustand-demo.pmnd.rs/) (상태 관리)
  - [React Hook Form](https://react-hook-form.com/) (폼 관리)
  - [Lucide React](https://lucide.dev/) (아이콘)
  - [Marked](https://marked.js.org/) (마크다운 파싱)

- **Backend**:  
  - [Prisma ORM](https://www.prisma.io/) + SQLite (개발 DB)
  - [NextAuth.js](https://next-auth.js.org/) (인증)

- **DevOps/기타**:  
  - ESLint, TypeScript, Vercel 배포 최적화

<br/>

2. 디렉토리 구조
```
src/
├── app/                    # App Router 페이지 및 API 라우터
│   ├── api/               # API 엔드포인트
│   ├── (pages)/           # 페이지 컴포넌트
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── posts/            # 포스트 관련 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 및 설정
└── types/                # 타입 정의
```

## 🎨 디자인 시스템 및 스타일 가이드

1. 컬러 시스템
```
:root {
  --background: #ffffff;    /* 기본 배경색 */
  --foreground: #171717;    /* 기본 텍스트 색상 */
}
```
2. 컴포넌트 스타일 패턴
- shadcn/ui 기반: class-variance-authority와 tailwind-merge를 활용한 변형 기반 컴포넌트
- Variant 패턴: Button 컴포넌트에서 default, destructive, outline, secondary, ghost, link 등 다양한 스타일 변형 제공

## 🖼️ 주요 기능

- **마크다운 에디터**  
  직관적인 마크다운 에디터로 쉽고 빠르게 기술 블로그 작성

- **태그 시스템**  
  포스트를 태그로 분류, 관심 주제별 탐색 지원

- **커뮤니티**  
  댓글, 좋아요, 실시간 피드백

- **소셜 로그인**  
  (NextAuth 기반, 다양한 OAuth 지원 가능)

- **반응형 UI**  
  모바일/데스크탑 모두 최적화

- **다크 모드 지원**

<br/>

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 2. 개발 서버 실행

```bash
npm run dev
```
- [http://localhost:3000](http://localhost:3000) 접속

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고,  
필요한 환경변수(예: NEXTAUTH_SECRET, DATABASE_URL 등)를 설정하세요.

<br/>

## 📝 폴더 구조 (임시)

```
src/
  app/           # Next.js App Router 엔트리
  components/    # UI/레이아웃/공통 컴포넌트
  hooks/         # 커스텀 훅
  lib/           # 유틸리티, API, Prisma 등
  types/         # 타입 정의
  ...
prisma/          # Prisma 스키마 및 마이그레이션
public/          # 정적 파일
```

<br/>


## 🛡️ 라이선스

MIT License

<br/>

---

**문의/제안/버그 리포트는 이슈로 남겨주세요!**

---
