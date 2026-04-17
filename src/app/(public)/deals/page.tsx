import { permanentRedirect } from 'next/navigation';

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const query = new URLSearchParams();

  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          query.append(key, item);
        }
      });
      return;
    }

    if (typeof value === 'string') {
      query.set(key, value);
    }
  });

  permanentRedirect(query.size > 0 ? `/?${query.toString()}` : '/');
}
