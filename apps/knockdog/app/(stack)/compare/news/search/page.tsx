import { route } from '@shared/constants/route';
import { redirectKeepingQuery } from '@shared/lib/navigation/redirectKeepingQuery';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  redirectKeepingQuery(route.kindergarten.news.search.root, await searchParams);
}
