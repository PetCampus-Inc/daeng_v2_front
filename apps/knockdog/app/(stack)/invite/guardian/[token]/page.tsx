import type { Metadata } from 'next';
import { getGuardianInvite } from '@entities/guardian-invite';
import { GuardianInvitePage } from '@views/guardian-invite/guardian-info';
import { generatePageMetadata } from '@shared/lib/metadata/generatePageMetadata';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';
const GUARDIAN_INVITE_IMAGE_URL = `${WEB_URL}/images/img_ls.png`;

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const url = `${WEB_URL}/invite/guardian/${encodeURIComponent(token)}`;

  try {
    const invite = await getGuardianInvite(token);

    return generatePageMetadata({
      url,
      title: `${invite.data.schoolName} 보호자 초대`,
      description: `${invite.data.schoolName}에서 보낸 초대장을 확인해 주세요.`,
      images: [GUARDIAN_INVITE_IMAGE_URL],
    });
  } catch {
    return generatePageMetadata({
      url,
      title: '똑독 보호자 초대',
      description: '보호자 초대장을 확인해 주세요.',
      images: [GUARDIAN_INVITE_IMAGE_URL],
    });
  }
}

export default function Page() {
  return <GuardianInvitePage />;
}
