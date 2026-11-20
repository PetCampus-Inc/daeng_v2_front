import { redirect } from 'next/navigation';

type SearchParamValue = string | string[] | undefined;

function redirectKeepingQuery(pathname: string, searchParams: Record<string, SearchParamValue>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') query.append(key, value);
    else if (value) value.forEach((item) => query.append(key, item));
  }

  const serialized = query.toString();
  redirect(serialized ? `${pathname}?${serialized}` : pathname);
}

export { redirectKeepingQuery };
