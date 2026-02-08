import type { Metadata } from 'next';
import { KindergartenDetailPage } from '@views/kindergarten-detail-page';
import { getKindergartenMain } from '@entities/kindergarten/api/kindergarten-main';
import { generatePageMetadata } from '@shared/lib/metadata/generatePageMetadata';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // 메타데이터 생성용 유치원 정보 조회 - 거리 계산 불필요하여 좌표 0으로 설정
    const kindergarten = await getKindergartenMain({ id, lat: 0, lng: 0 });

    return generatePageMetadata({
      url: `${WEB_URL}/kindergarten/${id}`,
      title: kindergarten.title,
      description: `${kindergarten.title}의 위치, 가격, 리뷰 정보를 똑독에서 확인하세요.`,
      images: kindergarten.banner
      .map((image) => (image ? `${IMAGE_BASE_URL}${encodeURI(image)}` : undefined))
      .filter((url): url is string => !!url)
    });
  } catch {
    return generatePageMetadata({
      url: `${WEB_URL}/kindergarten/${id}`,
    });
  }
}

export default function Page() {
  return <KindergartenDetailPage />;
}
