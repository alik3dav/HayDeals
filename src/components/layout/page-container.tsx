import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('container py-6 md:py-8', className)}>{children}</div>;
}
