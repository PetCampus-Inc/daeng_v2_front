import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareCompletePage } from '@views/compare-complete-page';
import { getComparisons } from '@entities/compare/api/comparisons';
import { resolveIds, s3ToUrl } from '@entities/compare';
import { generatePageMetadata } from '@shared/lib/metadata/generatePageMetadata';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';

interface PageProps {
  searchParams: Promise<{ids: string, lat?: string, lng?: string}>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const ids = resolveIds(new URLSearchParams(resolvedParams as Record<string, string>));

  if (ids.length < 2) {
    return generatePageMetadata({ url: `${WEB_URL}/compare-complete` });
  }

  try {
    // 메타데이터 생성용 유치원 정보 조회 - 거리 계산 불필요하여 좌표 0으로 설정
    const response = await getComparisons({ ids, basePoint: { lat: 0, lng: 0 } });
    const kindergartens = response.data;

    const names = kindergartens.map((k) => k.name);
    const images = kindergartens.map((k) => s3ToUrl(k.thumbnailS3Key)).filter((url): url is string => !!url);

    const url = `${WEB_URL}/compare-complete?ids=${ids.join(',')}`;

    return generatePageMetadata({
      url,
      title: `${names.join('와 ')} 비교 결과`,
      description: `${names.join('와 ')}의 비교 결과를 똑독에서 확인하세요.`,
      images,
    });
  } catch {
    return generatePageMetadata({ url: `${WEB_URL}/compare-complete` });
  }
}

export default function Page() {
  return (
    <Suspense>
      <CompareCompletePage />
    </Suspense>
  );
}
