'use client';

import { useMemo, useState } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { formatKoreanHistoryDate } from '@views/guardian-kindergarten-history-page/lib/formatGuardianConnectionHistory';
import type { GuardianConnectionHistoryItem } from '@views/guardian-kindergarten-history-page/model/guardianConnectionHistory';
import { useGuardianConnectionDisconnect } from '@views/guardian-kindergarten-history-page/model/useGuardianConnectionDisconnect';
import { isKindergartenId } from '@entities/kindergarten';
import { useStackNavigation } from '@shared/lib/bridge';

interface GuardianConnectionHistoryCardProps {
  item: GuardianConnectionHistoryItem;
  petName: string;
  /** 해제에 성공했을 때. 이전 이력으로 옮기는 일은 부모가 한다 */
  onDisconnected?: (disconnectedAt: string) => void;
  /** 이미 해제된 연결이라 이력을 다시 불러와야 할 때 */
  onHistoryOutdated?: () => void;
}

interface DisconnectButtonProps {
  /** 리뷰 작성 버튼과 나란히 놓일 때는 칸을 가득 채우고, 혼자일 때는 고정 너비로 가운데에 둔다 */
  isAlone: boolean;
  kindergartenName: string;
  petName: string;
  placeId: string | null;
  schoolPetMembershipId: string | null;
  onDisconnected?: (disconnectedAt: string) => void;
  onHistoryOutdated?: () => void;
}

function DisconnectButton({
  isAlone,
  kindergartenName,
  petName,
  placeId,
  schoolPetMembershipId,
  onDisconnected,
  onHistoryOutdated,
}: DisconnectButtonProps) {
  const content = guardianConnectionHistoryContent;
  const { handleDisconnectClick, isDisconnecting } = useGuardianConnectionDisconnect({
    kindergartenName,
    petName,
    placeId,
    schoolPetMembershipId,
    onDisconnected,
    onHistoryOutdated,
  });

  return (
    <ActionButton
      type='button'
      variant='secondaryFill'
      size='medium'
      className={cn('body2-bold', isAlone && 'w-[174px]')}
      disabled={isDisconnecting}
      onClick={() => {
        void handleDisconnectClick();
      }}
    >
      {content.disconnectButtonLabel}
    </ActionButton>
  );
}

function WriteReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <ActionButton type='button' variant='primaryFill' size='medium' onClick={onClick}>
      {guardianConnectionHistoryContent.writeReviewButtonLabel}
    </ActionButton>
  );
}

function GuardianConnectionHistoryCard({
  item,
  petName,
  onDisconnected,
  onHistoryOutdated,
}: GuardianConnectionHistoryCardProps) {
  const { push } = useStackNavigation();
  const content = guardianConnectionHistoryContent;
  const { disconnectedAt } = item;
  const isCurrent = disconnectedAt == null;
  const imageSrc = useMemo(() => item.imageUrl.trim(), [item.imageUrl]);
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const isImageFailed = failedImageSrc === imageSrc;
  const showImage = imageSrc.length > 0 && !isImageFailed;
  const connectedLabel = formatKoreanHistoryDate(item.connectedAt);
  const disconnectedLabel = disconnectedAt ? formatKoreanHistoryDate(disconnectedAt) : content.currentLabel;
  const badgeLabel = `${content.attendanceBadgePrefix} ${item.attendanceDayCount}${content.attendanceBadgeSuffix}`;
  const canWriteReview = item.canWriteReview && isKindergartenId(item.placeId);

  const handleWriteReview = () => {
    if (!isKindergartenId(item.placeId)) return;
    push({ pathname: `/kindergarten/${item.placeId}/write-review` });
  };

  return (
    <div className={cn('radius-r3 flex w-full flex-col gap-4 p-4', isCurrent ? 'bg-bg-0 shadow-sm' : 'bg-bg-100')}>
      <div className='flex w-full items-start gap-2'>
        <div className='gap-x2 flex min-w-0 flex-1 items-start'>
          <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- 썸네일은 절대 URL 또는 S3 키
              <img
                src={imageSrc}
                alt={item.name}
                className='size-full object-cover'
                loading='lazy'
                decoding='async'
                referrerPolicy='no-referrer'
                onError={() => setFailedImageSrc(imageSrc)}
              />
            ) : (
              <div className='bg-fill-secondary-100 flex size-full items-center justify-center' aria-hidden='true'>
                <Icon icon='Paw' className='text-fill-secondary-300 size-5' />
              </div>
            )}
          </div>
          <div className='flex min-w-0 flex-1 flex-col items-start'>
            <p className='body1-bold text-text-primary w-full truncate'>{item.name}</p>
            <p className='body2-regular text-text-secondary w-full truncate'>{item.address}</p>
          </div>
        </div>

        <span
          className={cn(
            'caption1-semibold shrink-0 rounded-full border px-2 py-1',
            isCurrent ? 'border-line-accent text-text-accent' : 'border-line-200 text-text-secondary'
          )}
        >
          {badgeLabel}
        </span>
      </div>

      <div className='bg-bg-50 radius-r2 flex w-full items-center gap-1 overflow-hidden px-4 py-2'>
        {isCurrent ? (
          <>
            <span className='body2-semibold text-text-primary'>{connectedLabel}</span>
            <span className='body2-semibold text-text-primary'>~</span>
            <span className='body2-bold text-text-primary'>{disconnectedLabel}</span>
          </>
        ) : (
          <span className='body2-semibold text-text-secondary'>
            {connectedLabel} ~ {disconnectedLabel}
          </span>
        )}
      </div>

      {isCurrent && canWriteReview ? (
        <div className='flex gap-2'>
          <div className='min-w-0 flex-1'>
            <DisconnectButton
              isAlone={false}
              kindergartenName={item.name}
              petName={petName}
              placeId={item.placeId}
              schoolPetMembershipId={item.schoolPetMembershipId}
              onDisconnected={onDisconnected}
              onHistoryOutdated={onHistoryOutdated}
            />
          </div>
          <div className='min-w-0 flex-1'>
            <WriteReviewButton onClick={handleWriteReview} />
          </div>
        </div>
      ) : null}

      {isCurrent && !canWriteReview ? (
        <div className='flex justify-center'>
          <DisconnectButton
            isAlone
            kindergartenName={item.name}
            petName={petName}
            placeId={item.placeId}
            schoolPetMembershipId={item.schoolPetMembershipId}
            onDisconnected={onDisconnected}
            onHistoryOutdated={onHistoryOutdated}
          />
        </div>
      ) : null}

      {!isCurrent && canWriteReview ? <WriteReviewButton onClick={handleWriteReview} /> : null}
    </div>
  );
}

export { GuardianConnectionHistoryCard };
