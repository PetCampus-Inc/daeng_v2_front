import { KindergartenDetailPage } from '@pages/kindergarten-detail-page';
import { generateKindergartenMetadata } from '@shared/lib/metadata/kindergartenMetadata';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = params;

  // TODO: 실제 API에서 유치원 데이터 가져오기
  // const kindergarten = await getKindergarten(id);

  // 임시 데이터 (실제 API 연동 시 제거)
  const mockKindergarten = {
    id,
    title: '유치원 상세 정보',
    description: '똑독에서 유치원 정보를 확인하고 예약하세요.',
    banner: ['/images/kindergarten-og-image.jpg'],
  };

  return generateKindergartenMetadata(mockKindergarten);
}

export default function Page() {
  return (
    <div>
      <KindergartenDetailPage />
    </div>
  );
}
