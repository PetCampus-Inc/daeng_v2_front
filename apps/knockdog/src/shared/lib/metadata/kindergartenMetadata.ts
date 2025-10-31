import { Metadata } from 'next';

interface KindergartenData {
  id: string;
  title: string;
  description?: string;
  banner?: string[];
  address?: string;
  phoneNumber?: string;
}

export function generateKindergartenMetadata(kindergarten: KindergartenData): Metadata {
  const { id, title, description, banner, address } = kindergarten;

  // 기본 이미지 (유치원 배너가 있으면 첫 번째 이미지 사용, 없으면 기본 이미지)
  const ogImage =
    (banner && banner.length > 0 ? banner[0] : '/images/kindergarten-og-image.jpg') ||
    '/images/kindergarten-og-image.jpg';

  const fullDescription =
    description || `${title}${address ? ` - ${address}` : ''} | 놀독에서 유치원 정보를 확인하고 예약하세요.`;

  return {
    title: `${title} | 놀독`,
    description: fullDescription,
    openGraph: {
      title: `${title} | 놀독`,
      description: fullDescription,
      url: `https://knockdog.com/kindergarten/${id}`,
      siteName: '놀독',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | 놀독`,
      description: fullDescription,
      images: [ogImage],
    },
  };
}
