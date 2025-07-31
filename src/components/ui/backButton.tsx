// src/components/ui/button.tsx
import * as React from 'react';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type MoveType = 'tags' | 'users' | 'posts';

const text: { [K in MoveType]: string } = {
  tags: '태그 목록으로',
  posts: '포스트 목록으로',
  users: '홈으로',
};

interface BackButtonProps {
  moveType: MoveType;
}

const BackButton = (props: BackButtonProps) => {
  const searchParams = useSearchParams();
  const fromSearch = searchParams.get('from') === 'search';

  return (
    <Button asChild variant="ghost" size="sm">
      <Link href={fromSearch ? `/search?q=${searchParams.get('q')}&tab=${searchParams.get('tab')}` : `/${props.moveType}`}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {fromSearch ? '통합검색' : `${text[props?.moveType]}`}
      </Link>
    </Button>
  );
};
BackButton.displayName = 'BackButton';

export { BackButton };
