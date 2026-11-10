'use client';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { useGuardianConnectionHistory } from '@views/guardian-kindergarten-history-page/model/useGuardianConnectionHistory';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

import { GuardianConnectionHistoryCard } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionHistoryCard';
import { GuardianConnectionHistoryEmpty } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionHistoryEmpty';
import { GuardianHistoryPetSelector } from '@views/guardian-kindergarten-history-page/ui/GuardianHistoryPetSelector';
import { Header } from '@widgets/Header';
import { PageError } from '@shared/ui/page-error';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

function GuardianKindergartenHistoryPage() {
  const content = guardianConnectionHistoryContent;
  const { pets, selectedPet, hasNoPet, setSelectedPetId } = useGuardianSelectedPet();
  const { items, isPending, isError, isFetching, refetch, markDisconnected } = useGuardianConnectionHistory();

  const petName = selectedPet?.name?.trim() || '강아지';
  const currentItem = items.find((item) => item.disconnectedAt == null);
  const previousItems = items.filter((item) => item.disconnectedAt != null);
  const hasNoHistory = hasNoPet || (!isPending && items.length === 0);

  return (
    <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col'>
      <div className='shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isError ? (
        <PageError layout='inline' isRetrying={isFetching} onRetry={refetch} />
      ) : (
        <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]'>
          {selectedPet ? (
            <GuardianHistoryPetSelector pets={pets} selectedPet={selectedPet} onSelect={setSelectedPetId} />
          ) : null}

          {isPending ? (
            <DelayedLoadingSpinner isLoading={isPending} layout='content' className='min-h-[200px]' />
          ) : hasNoHistory ? (
            <GuardianConnectionHistoryEmpty />
          ) : (
            <div className='px-x4 flex flex-col gap-7 pt-5 pb-[max(2rem,var(--safe-area-inset-bottom,0px))]'>
              <section aria-label={content.currentSectionTitle} className='flex flex-col gap-2.5'>
                <h2 className='body2-bold text-text-secondary'>{content.currentSectionTitle}</h2>
                {currentItem ? (
                  <GuardianConnectionHistoryCard
                    item={currentItem}
                    petName={petName}
                    onDisconnected={(disconnectedAt) => markDisconnected(currentItem.id, disconnectedAt)}
                    onHistoryOutdated={refetch}
                  />
                ) : (
                  <p className='body1-regular text-text-secondary bg-bg-50 radius-r3 px-x4 py-x6 text-center'>
                    {content.currentEmpty}
                  </p>
                )}
              </section>

              <section aria-label={content.previousSectionTitle} className='flex flex-col gap-2.5'>
                <h2 className='body2-semibold text-text-secondary flex items-center gap-1.5'>
                  {content.previousSectionTitle}
                  <span className='text-text-caption'>{previousItems.length}</span>
                </h2>
                {previousItems.length > 0 ? (
                  <ul className='flex flex-col gap-3'>
                    {previousItems.map((item) => (
                      <li key={item.id}>
                        <GuardianConnectionHistoryCard item={item} petName={petName} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { GuardianKindergartenHistoryPage };
