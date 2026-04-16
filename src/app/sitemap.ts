import type { MetadataRoute } from 'next';

import { getFeedFacets } from '@/features/deals/queries';
import { createClient } from '@/lib/supabase/server';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [dealsResponse, profilesResponse, facets] = await Promise.all([
    supabase.from('deals').select('id, created_at').eq('moderation_status', 'approved').order('created_at', { ascending: false }).limit(5000),
    supabase.from('profiles').select('username, created_at').not('username', 'is', null).order('created_at', { ascending: false }).limit(5000),
    getFeedFacets().catch(() => ({ categories: [], stores: [], dealTypes: [] })),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  const dealPages: MetadataRoute.Sitemap = (dealsResponse.data ?? []).map((deal) => ({
    url: absoluteUrl(`/deals/${deal.id}`),
    lastModified: new Date(deal.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const profilePages: MetadataRoute.Sitemap = (profilesResponse.data ?? [])
    .filter((profile) => Boolean(profile.username))
    .map((profile) => ({
      url: absoluteUrl(`/users/${encodeURIComponent(profile.username ?? '')}`),
      lastModified: new Date(profile.created_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  const categoryPages: MetadataRoute.Sitemap = facets.categories.map((category) => ({
    url: absoluteUrl(`/?category=${encodeURIComponent(category.value)}`),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const storePages: MetadataRoute.Sitemap = facets.stores.map((store) => ({
    url: absoluteUrl(`/?store=${encodeURIComponent(store.value)}`),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const discussedPage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/?sort=discussed'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...dealPages, ...profilePages, ...categoryPages, ...storePages, ...discussedPage];
}
