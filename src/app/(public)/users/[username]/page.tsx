import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageContainer } from '@/components/layout/page-container';
import { PublicProfileCommentsSection } from '@/features/profile/components/public-profile-comments-section';
import { PublicProfileDealsSection } from '@/features/profile/components/public-profile-deals-section';
import { PublicProfileIdentityCard } from '@/features/profile/components/public-profile-identity-card';
import { buildProfileDisplayName } from '@/features/profile/identity';
import { getPublicProfileByUsername, getPublicProfileComments, getPublicProfileDeals } from '@/features/profile/public-profile.queries';
import { absoluteUrl, buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    return buildPageMetadata({
      title: 'Profile not found',
      description: 'The requested public profile could not be found.',
      pathname: `/users/${encodeURIComponent(username)}`,
      noIndex: true,
    });
  }

  const displayName = buildProfileDisplayName(profile);

  return buildPageMetadata({
    title: `${displayName} (@${profile.username})`,
    description: `View public deals and comments from @${profile.username} on CipiDeals.`,
    pathname: `/users/${encodeURIComponent(profile.username)}`,
  });
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const [deals, comments] = await Promise.all([getPublicProfileDeals(profile.id), getPublicProfileComments(profile.id)]);
  const displayName = buildProfileDisplayName(profile);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl(`/users/${encodeURIComponent(profile.username)}`),
    mainEntity: {
      '@type': 'Person',
      name: displayName,
      alternateName: `@${profile.username}`,
      image: profile.avatar_url || undefined,
    },
  };

  return (
    <PageContainer className="max-w-5xl space-y-4 py-4">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      <PublicProfileIdentityCard profile={profile} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <PublicProfileDealsSection deals={deals} />
        <PublicProfileCommentsSection comments={comments} />
      </div>
    </PageContainer>
  );
}
