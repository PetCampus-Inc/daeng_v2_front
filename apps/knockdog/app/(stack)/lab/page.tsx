import { useQuery } from '@tanstack/react-query';

export default function TestPage() {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: () => fetch('/test.json').then((res) => res.json()),
  });

  return <div>{JSON.stringify(data)}</div>;
}
