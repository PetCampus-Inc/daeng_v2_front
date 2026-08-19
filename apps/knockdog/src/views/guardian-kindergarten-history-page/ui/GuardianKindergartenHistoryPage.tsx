'use client';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { useGuardianConnectionHistory } from '@views/guardian-kindergarten-history-page/model/useGuardianConnectionHistory';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { Header } from '@widgets/Header';
import { PageError } from '@shared/ui/page-error';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';
import { getSubjectParticle } from '@shared/utils';

import { GuardianConnectionHistoryCard } from './GuardianConnectionHistoryCard';

function GuardianKindergartenHistoryPage() {
  const content = guardianConnectionHistoryContent;
  const { selectedPet } = useGuardianSelectedPet();
  const { items, isPending, isError, isFetching, refetch } = useGuardianConnectionHistory();

  const petName = selectedPet?.name?.trim() || '강아지';
  const subjectParticle = getSubjectParticle(petName);

  return (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{content.pageTitle}</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='px-x4 flex flex-col gap-1 pt-5 pb-3'>
          <p className='h2-extrabold text-text-primary'>
            <span className='text-text-accent'>{petName}</span>
            <span>
              {subjectParticle} {content.titleSuffix}
            </span>
          </p>
          <p className='body1-medium text-text-primary'>{content.subtitle}</p>
        </div>

        <div className='px-x4 flex flex-col gap-3 pb-8'>
          {isError ? (
            <PageError layout='inline' isRetrying={isFetching} onRetry={refetch} />
          ) : isPending ? (
            <div className='flex justify-center py-16'>
              <RingLoadingSpinner />
            </div>
          ) : (
            items.map((item) => <GuardianConnectionHistoryCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenHistoryPage };
