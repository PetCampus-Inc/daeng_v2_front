import { GuardianInvitePage } from '@views/guardian-invite-page';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return <GuardianInvitePage token={token} />;
}
