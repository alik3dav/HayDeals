import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 md:py-8 lg:px-6', className)}>{children}</div>;
}
