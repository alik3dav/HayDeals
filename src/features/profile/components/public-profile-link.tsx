import type { ReactNode } from 'react';
import Link from 'next/link';

import { getPublicProfilePath } from '@/features/profile/identity';

export function PublicProfileLink({ username, className, children }: { username: string | null | undefined; className?: string; children: ReactNode }) {
  const profilePath = getPublicProfilePath(username);

  if (!profilePath) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link className={className} href={profilePath}>
      {children}
    </Link>
  );
}
