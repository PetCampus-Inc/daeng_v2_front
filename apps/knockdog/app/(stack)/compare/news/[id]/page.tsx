import { route } from '@shared/constants/route';
import { redirectKeepingQuery } from '@shared/lib/navigation/redirectKeepingQuery';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  redirectKeepingQuery(route.kindergarten.news.detail.root.replace('[id]', id), await searchParams);
}
