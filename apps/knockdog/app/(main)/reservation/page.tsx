import { GuardianReservationPage } from '@views/guardian-reservation-page';
import { SafeArea } from '@shared/ui/safe-area';

export default function Page() {
  return (
    <SafeArea edges={['top']} className='flex min-h-0 flex-1 flex-col'>
      <GuardianReservationPage />
    </SafeArea>
  );
}
