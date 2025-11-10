import { useQueryState, parseAsString } from 'nuqs';

export function useSearchQuery() {
  const [query, setQuery] = useQueryState('query', parseAsString);

  return {
    query,
    setQuery,
  };
}

