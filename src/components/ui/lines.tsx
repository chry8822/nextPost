import * as React from 'react';
import { cn } from '@/lib/utils';

interface VerticalLineProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
}

const heightClasses = {
  1: 'h-1',
  2: 'h-2',
  3: 'h-3',
  4: 'h-4',
  5: 'h-5',
  6: 'h-6',
  8: 'h-8',
  10: 'h-10',
  12: 'h-12',
  16: 'h-16',
  20: 'h-20',
  24: 'h-24',
} as const;

const VerticalLine = React.forwardRef<HTMLDivElement, VerticalLineProps>(({ className, height = 4, ...props }, ref) => (
  <div ref={ref} className={cn(`w-px bg-gray-400 mx-2`, heightClasses[height], className)} {...props} />
));
VerticalLine.displayName = 'VerticalLine';

export { VerticalLine };
