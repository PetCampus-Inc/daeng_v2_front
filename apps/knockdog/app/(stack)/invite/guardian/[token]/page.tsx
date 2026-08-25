import type { Metadata } from 'next';
import { getGuardianInvite } from '@entities/guardian-invite';
import { getKindergartenMain } from '@entities/kindergarten/api/kindergarten-main';
import { GuardianInvitePage } from '@views/guardian-invite/guardian-info';
import { generatePageMetadata } from '@shared/lib/metadata/generatePageMetadata';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const url = `${WEB_URL}/invite/guardian/${encodeURIComponent(token)}`;

  try {
    const invite = await getGuardianInvite(token);
    const kindergarten = await getKindergartenMain({ id: String(invite.data.schoolId), lat: 0, lng: 0 });
    const images = kindergarten.banner
      .map((image) => (image ? `${IMAGE_BASE_URL}${encodeURI(image)}` : undefined))
      .filter((image): image is string => Boolean(image));

    return generatePageMetadata({
      url,
      title: `${invite.data.schoolName} 보호자 초대`,
      description: `${invite.data.schoolName}에서 보낸 초대장을 확인해 주세요.`,
      images,
    });
  } catch {
    return generatePageMetadata({
      url,
      title: '똑독 보호자 초대',
      description: '보호자 초대장을 확인해 주세요.',
    });
  }
}

export default function Page() {
  return <GuardianInvitePage />;
}
