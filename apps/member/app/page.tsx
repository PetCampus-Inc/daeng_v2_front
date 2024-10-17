'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className=''>
      <button onClick={() => router.push('/docs')}>MAIN</button>
    </div>
  );
}
