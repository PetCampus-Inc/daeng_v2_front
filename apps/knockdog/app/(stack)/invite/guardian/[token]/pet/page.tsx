import { GuardianInvitePetSelectPage } from '@views/guardian-invite-pet-select-page';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return <GuardianInvitePetSelectPage token={token} />;
}
