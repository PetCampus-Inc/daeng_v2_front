import { Metadata } from 'next';

interface GeneratePageMetadataParams {
  url: string;
  title?: string;
  description?: string;
  images?: string[];
}

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';

function generatePageMetadata({ url, title, description, images }: GeneratePageMetadataParams): Metadata {
  const ogTitle = title || '똑독';
  const ogDescription = description || '똑독에서 유치원 정보를 확인하고 예약하세요.';
  const ogImage = images && images.length > 0 && images[0] ? images[0] : `${WEB_URL}/images/img_logo.png`;

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: '똑독',
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
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

export { generatePageMetadata };
